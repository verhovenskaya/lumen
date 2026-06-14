// src/shared/api/api.client.ts

interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers,
    };
  }

  private getFullUrl(path: string): string {
    // Убираем дублирование /api
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseURL}${cleanPath}`;
  }

  private getHeaders(token?: string): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(
    path: string,
    options: RequestInit,
    token?: string
  ): Promise<T> {
    const url = this.getFullUrl(path);
    console.log(`Making ${options.method} request to:`, url);
    console.log('Request body:', options.body);
    
    const response = await fetch(url, {
      ...options,
      headers: this.getHeaders(token),
    });

    console.log('Response status:', response.status);
    
    // Пытаемся получить текст ошибки для деталей
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return JSON.parse(responseText);
  }

  async get<T>(path: string, token?: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' }, token);
  }

  async post<T>(path: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(
      path,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      token
    );
  }

  async put<T>(path: string, data?: any, token?: string): Promise<T> {
    return this.request<T>(
      path,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      token
    );
  }

  async delete<T>(path: string, token?: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' }, token);
  }
}

// Создаем экземпляр клиента
export const apiClient = new ApiClient({
  baseURL: 'http://localhost:3000/api',
});