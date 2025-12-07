import { NextRequest, NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'b995a4aef269dfb0a78acd505524e20d';
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

        // Fetch weather data from OpenWeather One Call API 2.5 (free tier)
        const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${OPENWEATHER_API_KEY}`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            const errorText = await weatherResponse.text();
            console.error('OpenWeather API error:', weatherResponse.status, errorText);
            throw new Error(`OpenWeather API error: ${weatherResponse.status} - ${errorText}`);
        }

        const weatherData = await weatherResponse.json();

        // Fetch air quality data
        let airQuality = null;
        try {
            const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
            const aqiResponse = await fetch(aqiUrl);
            if (aqiResponse.ok) {
                airQuality = await aqiResponse.json();
            }
        } catch (error) {
            console.error('Air quality fetch failed:', error);
        }

        const result = {
            ...weatherData,
            air_quality: airQuality,
            location: {
                lat: parseFloat(lat as string),
                lon: parseFloat(lon as string),
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
