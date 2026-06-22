import { apiClient } from './client';

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  time: string; // ISO local datetime
}

export interface DailyForecast {
  date: string; // ISO 'YYYY-MM-DD'
  weatherCode: number;
  tempMin: number;
  tempMax: number;
  precipitation: number; // mm
  snowfall: number; // cm
  windMax: number; // km/h
  uvMax: number;
}

export interface AirQuality {
  europeanAqi: number | null;
  pm25: number | null;
  pm10: number | null;
}

export interface WeatherForecast {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecast[];
  airQuality: AirQuality;
}

export const weatherApi = {
  get: () => apiClient.get<WeatherForecast>('/api/weather'),
};
