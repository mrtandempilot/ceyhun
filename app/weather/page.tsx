'use client';

import { useState, useEffect } from 'react';
import {
    calculateThermalPotential,
    getFlightSuitability,
    getWindDirection,
    getUVSafetyLevel,
    formatPressureTrend,
    getMoonPhase,
    getFlightWindow,
    msToKmh,
    metersToKm,
    formatTemp,
    getWeatherIconUrl,
} from '@/lib/weatherUtils';

interface WeatherPageState {
    loading: boolean;
    error: string | null;
    data: any;
    lastUpdate: Date | null;
}

export default function WeatherPage() {
    const [state, setState] = useState<WeatherPageState>({
        loading: true,
        error: null,
        data: null,
        lastUpdate: null,
    });

    const fetchWeather = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const response = await fetch('/api/weather');

            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const data = await response.json();

            setState({
                loading: false,
                error: null,
                data,
                lastUpdate: new Date(),
            });
        } catch (error) {
            console.error('Weather fetch error:', error);
            setState(prev => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Failed to load weather data',
            }));
        }
    };

    useEffect(() => {
        fetchWeather();

        // Auto-refresh every 10 minutes
        const interval = setInterval(fetchWeather, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    if (state.loading && !state.data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading weather data...</p>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
                <div className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md border border-gray-700">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Weather</h2>
                    <p className="text-gray-300 mb-6">{state.error}</p>
                    <button
                        onClick={fetchWeather}
                        className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg transition-colors font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!state.data) return null;

    const { current, hourly, daily } = state.data;
    const windDir = getWindDirection(current.wind_deg);
    const uvSafety = getUVSafetyLevel(current.uvi || 0);

    // Get 7-day forecast
    const weekForecast = daily.slice(0, 7);

    // Get hourly temps for chart
    const hourlyTemps = hourly.slice(0, 24);
    const tempValues = hourlyTemps.map((h: any) => h.temp);
    const maxTemp = Math.max(...tempValues);
    const minTemp = Math.min(...tempValues);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-light text-gray-400 mb-2">📍 Ölüdeniz, Turkey</h1>
                    <p className="text-sm text-gray-500">
                        {state.lastUpdate && `Updated ${state.lastUpdate.toLocaleTimeString()}`}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Current Weather Card */}
                        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="text-7xl font-light mb-2">{Math.round(current.temp)}°C</div>
                                    <div className="text-xl text-gray-300 capitalize">{current.weather[0].description}</div>
                                </div>
                                <div className="text-8xl">
                                    {current.is_day ? '☀️' : '🌙'}
                                </div>
                            </div>
                        </div>

                        {/* Temperature Chart */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
                            <h3 className="text-lg font-semibold mb-6">Temperature</h3>

                            {/* Chart */}
                            <div className="relative h-32 mb-4">
                                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Area under curve */}
                                    <path
                                        d={`M 0,100 ${hourlyTemps.slice(0, 4).map((h: any, i: number) => {
                                            const x = (i / 3) * 400;
                                            const y = 100 - ((h.temp - minTemp) / (maxTemp - minTemp)) * 80;
                                            return `L ${x},${y}`;
                                        }).join(' ')} L 400,100 Z`}
                                        fill="url(#tempGradient)"
                                    />

                                    {/* Line */}
                                    <path
                                        d={`M ${hourlyTemps.slice(0, 4).map((h: any, i: number) => {
                                            const x = (i / 3) * 400;
                                            const y = 100 - ((h.temp - minTemp) / (maxTemp - minTemp)) * 80;
                                            return `${x},${y}`;
                                        }).join(' L ')}`}
                                        stroke="#fbbf24"
                                        strokeWidth="3"
                                        fill="none"
                                        className="animate-pulse"
                                    />

                                    {/* Points */}
                                    {hourlyTemps.slice(0, 4).map((h: any, i: number) => {
                                        const x = (i / 3) * 400;
                                        const y = 100 - ((h.temp - minTemp) / (maxTemp - minTemp)) * 80;
                                        return (
                                            <circle
                                                key={i}
                                                cx={x}
                                                cy={y}
                                                r="4"
                                                fill="#fbbf24"
                                                className="animate-pulse"
                                            />
                                        );
                                    })}
                                </svg>
                            </div>

                            {/* Labels */}
                            <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                <div>
                                    <div className="text-gray-400">Morning</div>
                                    <div className="font-semibold">{Math.round(hourlyTemps[0]?.temp || 0)}°</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Afternoon</div>
                                    <div className="font-semibold">{Math.round(hourlyTemps[1]?.temp || 0)}°</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Evening</div>
                                    <div className="font-semibold">{Math.round(hourlyTemps[2]?.temp || 0)}°</div>
                                </div>
                                <div>
                                    <div className="text-gray-400">Night</div>
                                    <div className="font-semibold">{Math.round(hourlyTemps[3]?.temp || 0)}°</div>
                                </div>
                            </div>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchWeather}
                            disabled={state.loading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900 font-semibold py-4 rounded-2xl transition-all disabled:opacity-50"
                        >
                            {state.loading ? 'Refreshing...' : '🔄 Refresh Weather'}
                        </button>
                    </div>

                    {/* Middle & Right Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 7-Day Forecast */}
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
                            <div className="grid grid-cols-7 gap-3">
                                {weekForecast.map((day: any, index: number) => {
                                    const date = new Date(day.dt * 1000);
                                    const dayName = index === 0 ? 'Sun' : date.toLocaleDateString('en-US', { weekday: 'short' });
                                    const isToday = index === 0;

                                    return (
                                        <div
                                            key={index}
                                            className={`text-center p-4 rounded-2xl transition-all hover:scale-105 ${isToday ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-gray-700/30'
                                                }`}
                                        >
                                            <div className="text-sm text-gray-400 mb-2">{dayName}</div>
                                            <div className="text-4xl mb-2">
                                                {day.weather[0].main.includes('Cloud') ? '☁️' :
                                                    day.weather[0].main.includes('Rain') ? '🌧️' :
                                                        day.weather[0].main.includes('Clear') ? '☀️' : '⛅'}
                                            </div>
                                            <div className="font-semibold">{Math.round(day.temp.max)}°</div>
                                            <div className="text-sm text-gray-400">{Math.round(day.temp.min)}°</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Today's Overview */}
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Today's overview</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Wind Status */}
                                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                                    <div className="text-gray-400 mb-4">Wind Status</div>

                                    {/* Wind Chart */}
                                    <div className="flex items-end justify-center space-x-1 h-24 mb-4">
                                        {hourlyTemps.slice(0, 12).map((h: any, i: number) => {
                                            const windSpeed = msToKmh(h.wind_speed);
                                            const height = (windSpeed / 30) * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    className="bg-yellow-500 rounded-t transition-all hover:bg-yellow-400"
                                                    style={{
                                                        width: '6px',
                                                        height: `${Math.min(height, 100)}%`,
                                                        animation: `grow 0.5s ease-out ${i * 0.1}s backwards`
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-baseline justify-between">
                                        <div className="text-2xl font-bold">{msToKmh(current.wind_speed)} km/h</div>
                                        <div className="text-sm text-gray-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>

                                {/* UV Index */}
                                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                                    <div className="text-gray-400 mb-4">UV Index</div>

                                    {/* UV Gauge */}
                                    <div className="relative w-32 h-32 mx-auto mb-4">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="#374151"
                                                strokeWidth="12"
                                                fill="none"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="url(#uvGradient)"
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={`${((current.uvi || 0) / 12) * 352} 352`}
                                                className="transition-all duration-1000"
                                            />
                                            <defs>
                                                <linearGradient id="uvGradient">
                                                    <stop offset="0%" stopColor="#fbbf24" />
                                                    <stop offset="100%" stopColor="#f97316" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold">{(current.uvi || 0).toFixed(1)}</div>
                                                <div className="text-xs text-gray-400">UV</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center text-sm font-semibold">{(current.uvi || 0).toFixed(2)} uv</div>
                                </div>

                                {/* Sunrise and Sunset */}
                                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                                    <div className="text-gray-400 mb-4">Sunrise and sunset</div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl">🌅</div>
                                                <div className="text-sm text-gray-400">Sunrise</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold">
                                                    {new Date(current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-xs text-gray-500">-1m 50s</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl">🌇</div>
                                                <div className="text-sm text-gray-400">Sunset</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold">
                                                    {new Date(current.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-xs text-gray-500">+2m 10s</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Humidity */}
                                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                                    <div className="text-gray-400 mb-4">Humidity</div>

                                    <div className="flex items-center justify-center mb-4">
                                        <div className="text-6xl">💧</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm text-gray-400">The dew point is {Math.round(current.dew_point)}° right now</div>
                                        <div className="text-3xl font-bold mt-2">{current.humidity}%</div>
                                    </div>
                                </div>

                                {/* Visibility */}
                                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                                    <div className="text-gray-400 mb-4">Visibility</div>

                                    <div className="flex items-center justify-center mb-4">
                                        <div className="text-6xl">👁️</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm text-gray-400">Haze is affecting visibility</div>
                                        <div className="text-3xl font-bold mt-2">{metersToKm(current.visibility)} km</div>
                                    </div>
                                </div>

                                {/* Feels Like */}
                                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                                    <div className="text-gray-400 mb-4">Feels like</div>

                                    <div className="flex items-center justify-center mb-4">
                                        <div className="text-6xl">🌡️</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm text-gray-400">
                                            {current.wind_chill < current.temp ? 'Wind is making it feel cooler' :
                                                current.heat_index > current.temp ? 'Humidity is making it feel warmer' :
                                                    'Similar to the actual temperature'}
                                        </div>
                                        <div className="text-3xl font-bold mt-2">{Math.round(current.feels_like)}°</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes grow {
          from {
            height: 0;
          }
        }
      `}</style>
        </div>
    );
}
