import { NextRequest, NextResponse } from 'next/server';

// WeatherAPI.com - Free tier: 1 million calls/month
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'db79cae0f84c47a68cf173752250712';
const DEFAULT_LAT = process.env.NEXT_PUBLIC_DEFAULT_LAT || '36.5500'; // Ölüdeniz
const DEFAULT_LON = process.env.NEXT_PUBLIC_DEFAULT_LON || '29.1167';

// Cache for weather data (10 minutes)
let weatherCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || DEFAULT_LAT;
    const lon = searchParams.get('lon') || DEFAULT_LON;

    // Check cache
    if (weatherCache && Date.now() - weatherCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(weatherCache.data);
    }

    // WeatherAPI.com Forecast API (includes current + 7 days forecast + hourly)
    const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=7&aqi=yes&alerts=yes`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('WeatherAPI error:', weatherResponse.status, errorText);
      throw new Error(`WeatherAPI error: ${weatherResponse.status} - ${errorText}`);
    }

    const weatherData = await weatherResponse.json();

    // Transform WeatherAPI data to match our component's expected format
    const current = weatherData.current;
    const location = weatherData.location;
    const forecast = weatherData.forecast.forecastday;

    // Build hourly forecast (48 hours from current + next day)
    const hourly = [];
    for (let i = 0; i < Math.min(forecast.length, 2); i++) {
      hourly.push(...forecast[i].hour);
    }

    // Build daily forecast
    const daily = forecast.map((day: any) => ({
      dt: new Date(day.date).getTime() / 1000,
      temp: {
        min: day.day.mintemp_c,
        max: day.day.maxtemp_c,
        day: day.day.avgtemp_c,
      },
      feels_like: {
        day: current.feelslike_c,
      },
      pressure: current.pressure_mb,
      humidity: day.day.avghumidity,
      dew_point: current.dewpoint_c,
      wind_speed: day.day.maxwind_kph / 3.6, // Convert to m/s
      wind_deg: current.wind_degree,
      wind_gust: current.gust_kph / 3.6,
      weather: [{
        id: day.day.condition.code,
        main: day.day.condition.text,
        description: day.day.condition.text,
        icon: getWeatherIcon(day.day.condition.code, true),
      }],
      clouds: day.day.cloud || 0,
      pop: day.day.daily_chance_of_rain / 100,
      uvi: day.day.uv,
      sunrise: new Date(`${day.date} ${day.astro.sunrise}`).getTime() / 1000,
      sunset: new Date(`${day.date} ${day.astro.sunset}`).getTime() / 1000,
      moon_phase: getMoonPhaseValue(day.astro.moon_phase),
    }));

    // Transform to match OpenWeather format for compatibility
    const result = {
      lat: location.lat,
      lon: location.lon,
      timezone: location.tz_id,
      current: {
        dt: current.last_updated_epoch,
        sunrise: new Date(`${forecast[0].date} ${forecast[0].astro.sunrise}`).getTime() / 1000,
        sunset: new Date(`${forecast[0].date} ${forecast[0].astro.sunset}`).getTime() / 1000,
        temp: current.temp_c,
        feels_like: current.feelslike_c,
        pressure: current.pressure_mb,
        humidity: current.humidity,
        dew_point: current.dewpoint_c,
        uvi: current.uv,
        clouds: current.cloud,
        visibility: current.vis_km * 1000, // Convert to meters
        wind_speed: current.wind_kph / 3.6, // Convert to m/s
        wind_deg: current.wind_degree,
        wind_gust: current.gust_kph / 3.6,
        weather: [{
          id: current.condition.code,
          main: current.condition.text,
          description: current.condition.text,
          icon: getWeatherIcon(current.condition.code, current.is_day === 1),
        }],
      },
      hourly: hourly.map((hour: any) => ({
        dt: hour.time_epoch,
        temp: hour.temp_c,
        feels_like: hour.feelslike_c,
        pressure: hour.pressure_mb,
        humidity: hour.humidity,
        dew_point: hour.dewpoint_c,
        uvi: hour.uv,
        clouds: hour.cloud,
        visibility: hour.vis_km * 1000,
        wind_speed: hour.wind_kph / 3.6,
        wind_deg: hour.wind_degree,
        wind_gust: hour.gust_kph / 3.6,
        weather: [{
          id: hour.condition.code,
          main: hour.condition.text,
          description: hour.condition.text,
          icon: getWeatherIcon(hour.condition.code, hour.is_day === 1),
        }],
        pop: hour.chance_of_rain / 100,
      })),
      daily,
      air_quality: weatherData.current.air_quality ? {
        list: [{
          main: {
            aqi: getAQILevel(weatherData.current.air_quality['us-epa-index']),
          },
          components: weatherData.current.air_quality,
        }]
      } : null,
      location: {
        lat: location.lat,
        lon: location.lon,
        name: location.name,
        country: location.country,
      }
    };

    // Update cache
    weatherCache = {
      data: result,
      timestamp: Date.now()
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch weather data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to convert moon phase text to number (0-1)
function getMoonPhaseValue(phase: string): number {
  const phases: { [key: string]: number } = {
    'New Moon': 0,
    'Waxing Crescent': 0.125,
    'First Quarter': 0.25,
    'Waxing Gibbous': 0.375,
    'Full Moon': 0.5,
    'Waning Gibbous': 0.625,
    'Last Quarter': 0.75,
    'Waning Crescent': 0.875,
  };
  return phases[phase] || 0;
}

// Helper function to convert US EPA AQI to 1-5 scale
function getAQILevel(usEpaIndex: number): number {
  if (usEpaIndex <= 1) return 1; // Good
  if (usEpaIndex <= 2) return 2; // Moderate
  if (usEpaIndex <= 3) return 3; // Unhealthy for sensitive
  if (usEpaIndex <= 4) return 4; // Unhealthy
  return 5; // Very unhealthy
}

// Helper function to map WeatherAPI condition codes to OpenWeather-style icons
function getWeatherIcon(code: number, isDay: boolean): string {
  const dayNight = isDay ? 'd' : 'n';

  // Map WeatherAPI codes to OpenWeather icon codes
  if (code === 1000) return `01${dayNight}`; // Clear
  if ([1003].includes(code)) return `02${dayNight}`; // Partly cloudy
  if ([1006, 1009].includes(code)) return `03${dayNight}`; // Cloudy
  if ([1030, 1135, 1147].includes(code)) return `50${dayNight}`; // Fog/Mist
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return `10${dayNight}`; // Rain
  if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return `13${dayNight}`; // Snow
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return `11${dayNight}`; // Thunderstorm

  return `01${dayNight}`; // Default to clear
}
