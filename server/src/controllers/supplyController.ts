import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { SupplyStatus, MovementType, Prisma } from '@prisma/client';

// Obtener todos los insumos con filtros y paginación
export const getSupplies = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category,
      status,
      lowStock = false,
      sortBy = 'createdAt', 
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { supplier: { contains: search as string } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (lowStock === 'true') {
      where.OR = [
        { status: SupplyStatus.LOW_STOCK },
        { status: SupplyStatus.OUT_OF_STOCK }
      ];
    }

    // Obtener insumos con paginación
    const [supplies, total] = await Promise.all([
      prisma.supply.findMany({
        where,
        include: {
          movements: {
            select: {
              id: true,
              type: true,
              quantity: true,
              createdAt: true,
              reason: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          _count: {
            select: {
              movements: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder }
      }),
      prisma.supply.count({ where })
    ]);

    // Actualizar estado de stock bajo automáticamente
    for (const supply of supplies) {
      if (supply.stock <= supply.minStock && supply.status === SupplyStatus.ACTIVE) {
        await prisma.supply.update({
          where: { id: supply.id },
          data: { status: SupplyStatus.LOW_STOCK }
        });
        supply.status = SupplyStatus.LOW_STOCK;
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Insumos obtenidos exitosamente',
      data: {
        supplies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener un insumo por ID
export const getSupplyById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const supply = await prisma.supply.findUnique({
      where: { id },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' }
        },
        expenses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!supply) {
      throw new AppError('Insumo no encontrado', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Insumo obtenido exitosamente',
      data: { supply }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo insumo
export const createSupply = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      category,
      unit,
      stock = 0,
      minStock = 0,
      maxStock,
      unitCost,
      supplier,
      expiryDate
    } = req.body;

    if (!name || !category || !unit || unitCost === undefined) {
      throw new AppError('Nombre, categoría, unidad y costo unitario son requeridos', 400);
    }

    if (unitCost < 0) {
      throw new AppError('El costo unitario debe ser mayor o igual a 0', 400);
    }

    if (stock < 0 || minStock < 0) {
      throw new AppError('El stock y stock mínimo deben ser mayores o iguales a 0', 400);
    }

    if (maxStock && maxStock < minStock) {
      throw new AppError('El stock máximo debe ser mayor al stock mínimo', 400);
    }

    // Verificar si ya existe un insumo con el mismo nombre
    const existingSupply = await prisma.supply.findFirst({
      where: { 
        name: { equals: name },
        status: { not: SupplyStatus.DISCONTINUED }
      }
    });

    if (existingSupply) {
      throw new AppError('Ya existe un insumo activo con este nombre', 409);
    }

    // Determinar estado inicial
    let initialStatus: SupplyStatus = SupplyStatus.ACTIVE;
    if (stock <= minStock) {
      initialStatus = stock === 0 ? SupplyStatus.OUT_OF_STOCK : SupplyStatus.LOW_STOCK;
    }

    const newSupply = await prisma.supply.create({
      data: {
        name,
        description,
        category,
        unit,
        stock: Number(stock),
        minStock: Number(minStock),
        maxStock: maxStock ? Number(maxStock) : null,
        unitCost: Number(unitCost),
        supplier,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: initialStatus
      }
    });

    // Crear movimiento inicial si hay stock
    if (stock > 0) {
      await prisma.supplyMovement.create({
        data: {
          supplyId: newSupply.id,
          type: MovementType.IN,
          quantity: Number(stock),
          unitCost: Number(unitCost),
          reason: 'Stock inicial',
          createdBy: req.user!.id
        }
      });
    }

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Supply',
        entityId: newSupply.id,
        newData: newSupply,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Insumo creado exitosamente',
      data: { supply: newSupply }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Actualizar un insumo
export const updateSupply = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      unit,
      minStock,
      maxStock,
      unitCost,
      supplier,
      expiryDate
    } = req.body;

    // Verificar que el insumo existe
    const existingSupply = await prisma.supply.findUnique({
      where: { id }
    });

    if (!existingSupply) {
      throw new AppError('Insumo no encontrado', 404);
    }

    // Validaciones
    if (unitCost !== undefined && unitCost < 0) {
      throw new AppError('El costo unitario debe ser mayor o igual a 0', 400);
    }

    if (minStock !== undefined && minStock < 0) {
      throw new AppError('El stock mínimo debe ser mayor o igual a 0', 400);
    }

    if (maxStock && minStock && maxStock < minStock) {
      throw new AppError('El stock máximo debe ser mayor al stock mínimo', 400);
    }

    // Verificar si ya existe otro insumo con el mismo nombre
    if (name && name !== existingSupply.name) {
      const duplicateSupply = await prisma.supply.findFirst({
        where: { 
          name: { equals: name },
          status: { not: SupplyStatus.DISCONTINUED },
          id: { not: id }
        }
      });

      if (duplicateSupply) {
        throw new AppError('Ya existe un insumo activo con este nombre', 409);
      }
    }

    const updatedSupply = await prisma.supply.update({
      where: { id },
      data: {
        name,
        description,
        category,
        unit,
        minStock: minStock !== undefined ? Number(minStock) : undefined,
        maxStock: maxStock !== undefined ? (maxStock ? Number(maxStock) : null) : undefined,
        unitCost: unitCost !== undefined ? Number(unitCost) : undefined,
        supplier,
        expiryDate: expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : undefined
      }
    });

    // Actualizar estado si es necesario
    if (minStock !== undefined) {
      let newStatus = updatedSupply.status;
      if (updatedSupply.stock <= Number(minStock)) {
        newStatus = updatedSupply.stock === 0 ? SupplyStatus.OUT_OF_STOCK : SupplyStatus.LOW_STOCK;
      } else if (updatedSupply.status === SupplyStatus.LOW_STOCK || updatedSupply.status === SupplyStatus.OUT_OF_STOCK) {
        newStatus = SupplyStatus.ACTIVE;
      }

      if (newStatus !== updatedSupply.status) {
        await prisma.supply.update({
          where: { id },
          data: { status: newStatus }
        });
        updatedSupply.status = newStatus;
      }
    }

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Supply',
        entityId: id,
        oldData: existingSupply,
        newData: updatedSupply,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Insumo actualizado exitosamente',
      data: { supply: updatedSupply }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Actualizar stock de un insumo
export const updateSupplyStock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { type, quantity, reason, unitCost } = req.body;

    if (!type || !quantity || quantity <= 0) {
      throw new AppError('Tipo de movimiento y cantidad son requeridos', 400);
    }

    if (!Object.values(MovementType).includes(type)) {
      throw new AppError('Tipo de movimiento inválido', 400);
    }

    // Verificar que el insumo existe
    const existingSupply = await prisma.supply.findUnique({
      where: { id }
    });

    if (!existingSupply) {
      throw new AppError('Insumo no encontrado', 404);
    }

    if (existingSupply.status === SupplyStatus.DISCONTINUED) {
      throw new AppError('No se puede modificar el stock de un insumo discontinuado', 400);
    }

    // Calcular nuevo stock
    let newStock = existingSupply.stock;
    if (type === MovementType.IN) {
      newStock += Number(quantity);
    } else if (type === MovementType.OUT) {
      newStock -= Number(quantity);
      if (newStock < 0) {
        throw new AppError('No hay suficiente stock disponible', 400);
      }
    } else if (type === MovementType.ADJUST) {
      newStock = Number(quantity);
    }

    // Determinar nuevo estado
    let newStatus: SupplyStatus = SupplyStatus.ACTIVE;
    if (newStock === 0) {
      newStatus = SupplyStatus.OUT_OF_STOCK;
    } else if (newStock <= existingSupply.minStock) {
      newStatus = SupplyStatus.LOW_STOCK;
    }

    // Actualizar en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear movimiento
      const movement = await tx.supplyMovement.create({
        data: {
          supplyId: id,
          type,
          quantity: Number(quantity),
          unitCost: unitCost ? Number(unitCost) : null,
          reason,
          createdBy: req.user!.id
        }
      });

      // Actualizar insumo
      const updatedSupply = await tx.supply.update({
        where: { id },
        data: {
          stock: newStock,
          status: newStatus
        }
      });

      return { movement, supply: updatedSupply };
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Supply',
        entityId: id,
        oldData: { stock: existingSupply.stock, status: existingSupply.status },
        newData: { stock: newStock, status: newStatus, movement: result.movement },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Stock actualizado exitosamente',
      data: { 
        supply: result.supply,
        movement: result.movement
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Cambiar estado de un insumo
export const updateSupplyStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(SupplyStatus).includes(status)) {
      throw new AppError('Estado de insumo inválido', 400);
    }

    // Verificar que el insumo existe
    const existingSupply = await prisma.supply.findUnique({
      where: { id }
    });

    if (!existingSupply) {
      throw new AppError('Insumo no encontrado', 404);
    }

    const updatedSupply = await prisma.supply.update({
      where: { id },
      data: { status }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Supply',
        entityId: id,
        oldData: { status: existingSupply.status },
        newData: { status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Estado del insumo actualizado a ${status}`,
      data: { supply: updatedSupply }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener insumos con stock bajo
export const getLowStockSupplies = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const supplies = await prisma.supply.findMany({
      where: {
        OR: [
          { status: { in: [SupplyStatus.LOW_STOCK, SupplyStatus.OUT_OF_STOCK] } }
        ],
        status: { not: SupplyStatus.DISCONTINUED }
      },
      orderBy: [
        { status: 'desc' },
        { stock: 'asc' }
      ]
    });

    const response: ApiResponse = {
      success: true,
      message: 'Insumos con stock bajo obtenidos exitosamente',
      data: { supplies }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener categorías de insumos
export const getSupplyCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.supply.findMany({
      where: { status: { not: SupplyStatus.DISCONTINUED } },
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories.map(c => c.category);

    const response: ApiResponse = {
      success: true,
      message: 'Categorías obtenidas exitosamente',
      data: { categories: categoryList }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener historial de movimientos de un insumo
export const getSupplyMovements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Verificar que el insumo existe
    const supply = await prisma.supply.findUnique({
      where: { id }
    });

    if (!supply) {
      throw new AppError('Insumo no encontrado', 404);
    }

    const [movements, total] = await Promise.all([
      prisma.supplyMovement.findMany({
        where: { supplyId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.supplyMovement.count({
        where: { supplyId: id }
      })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Historial de movimientos obtenido exitosamente',
      data: {
        movements,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
