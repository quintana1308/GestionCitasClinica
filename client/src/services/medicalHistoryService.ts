import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface MedicalHistoryRecord {
  id: string;
  clientId: string;
  date: string;
  diagnosis?: string;
  treatment: string;
  notes?: string;
  attachments?: string;
  createdBy: string;
  client: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface CreateMedicalHistoryData {
  clientId: string;
  appointmentId?: string;
  diagnosis?: string;
  treatment: string;
  notes?: string;
  attachments?: string;
}

export interface UpdateMedicalHistoryData {
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  attachments?: string;
}

export interface MedicalHistoryStats {
  totalRecords: number;
  recentRecords: MedicalHistoryRecord[];
  treatmentDistribution: Record<string, number>;
}

class MedicalHistoryService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  // Crear registro de historial médico
  async createMedicalHistory(data: CreateMedicalHistoryData): Promise<MedicalHistoryRecord> {
    const response = await axios.post(
      `${API_URL}/medical-history`,
      data,
      this.getAuthHeaders()
    );
    return response.data.data;
  }

  // Obtener historial médico de un cliente
  async getClientMedicalHistory(
    clientId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    records: MedicalHistoryRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await axios.get(
      `${API_URL}/medical-history/client/${clientId}?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    return response.data.data;
  }

  // Obtener registro específico
  async getMedicalHistory(id: string): Promise<MedicalHistoryRecord> {
    const response = await axios.get(
      `${API_URL}/medical-history/${id}`,
      this.getAuthHeaders()
    );
    return response.data.data;
  }

  // Actualizar registro
  async updateMedicalHistory(
    id: string,
    data: UpdateMedicalHistoryData
  ): Promise<MedicalHistoryRecord> {
    const response = await axios.put(
      `${API_URL}/medical-history/${id}`,
      data,
      this.getAuthHeaders()
    );
    return response.data.data;
  }

  // Eliminar registro
  async deleteMedicalHistory(id: string): Promise<void> {
    await axios.delete(
      `${API_URL}/medical-history/${id}`,
      this.getAuthHeaders()
    );
  }

  // Obtener estadísticas del historial médico
  async getMedicalHistoryStats(clientId: string): Promise<MedicalHistoryStats> {
    const response = await axios.get(
      `${API_URL}/medical-history/client/${clientId}/stats`,
      this.getAuthHeaders()
    );
    return response.data.data;
  }

  // Completar cita y crear historial médico
  async completeAppointmentWithHistory(
    appointmentId: string,
    data: {
      diagnosis?: string;
      treatment?: string;
      notes?: string;
      attachments?: string;
      requiresFollowUp?: boolean;
      followUpDate?: string;
      followUpNotes?: string;
    }
  ): Promise<{
    appointment: any;
    medicalHistory: MedicalHistoryRecord;
  }> {
    const response = await axios.post(
      `${API_URL}/medical-history/complete-appointment/${appointmentId}`,
      data,
      this.getAuthHeaders()
    );
    return response.data.data;
  }

  // Subir imágenes para historial médico
  async uploadImages(files: FileList, clientInfo?: { clientId: string; clientName: string }): Promise<{ images: string[]; count: number }> {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    // Agregar información del cliente si está disponible
    if (clientInfo) {
      formData.append('clientId', clientInfo.clientId);
      formData.append('clientName', clientInfo.clientName);
    }

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/medical-history/upload-images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  // Eliminar imagen del historial médico
  async deleteImage(imagePath: string): Promise<void> {
    await axios.post(
      `${API_URL}/medical-history/delete-image`,
      { imagePath },
      this.getAuthHeaders()
    );
  }
}

export default new MedicalHistoryService();
