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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading weather data...</p>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Weather</h2>
                    <p className="text-gray-300 mb-4">{state.error}</p>
                    <button
                        onClick={fetchWeather}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!state.data) return null;

    const { current, hourly, daily, air_quality } = state.data;
    const flightSuitability = getFlightSuitability(current);
    const uvSafety = getUVSafetyLevel(current.uvi || 0);
    const windDir = getWindDirection(current.wind_deg);
    const moonPhase = getMoonPhase(daily[0].moon_phase);
    const flightWindow = getFlightWindow(hourly.slice(0, 24));

    // Calculate thermal potential for current hour
    const currentHour = new Date().getHours();
    const thermal = calculateThermalPotential(
        current.temp,
        current.temp + 2, // Estimate ground temp slightly higher
        current.wind_speed,
        current.clouds,
        currentHour
    );

    // Get pressure trend (compare with 3 hours ago if available)
    const pressureTrend = hourly.length >= 3
        ? formatPressureTrend(current.pressure, hourly[3].pressure)
        : { trend: 'Unknown', icon: '?', description: 'Insufficient data' };

    // Air quality index
    const aqi = air_quality?.list?.[0]?.main?.aqi || 0;
    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiColors = ['text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400', 'text-purple-400'];

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            ⛅ Weather Forecast - Paragliding
                        </h1>
                        <p className="text-gray-400">
                            📍 Ölüdeniz, Turkey {state.lastUpdate && `• Updated ${state.lastUpdate.toLocaleTimeString()}`}
                        </p>
                    </div>
                    <button
                        onClick={fetchWeather}
                        disabled={state.loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                        <svg className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Flight Suitability Alert */}
                <div className={`${flightSuitability.color} rounded-lg p-4 mb-6`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">
                                Flight Suitability: {flightSuitability.rating}/10
                            </h2>
                            <p className="text-white">{flightSuitability.description}</p>
                        </div>
                        <div className="text-5xl font-bold text-white opacity-50">
                            {flightSuitability.rating}
                        </div>
                    </div>
                    {flightSuitability.warnings.length > 0 && (
                        <div className="mt-3 space-y-1">
                            {flightSuitability.warnings.map((warning, i) => (
                                <p key={i} className="text-white font-medium">{warning}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Weather */}
                <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Current Conditions</h2>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Temperature & Weather */}
                        <div className="col-span-2 flex items-center space-x-4">
                            <img
                                src={getWeatherIconUrl(current.weather[0].icon)}
                                alt={current.weather[0].description}
                                className="w-24 h-24"
                            />
                            <div>
                                <div className="text-5xl font-bold text-white">
                                    {formatTemp(current.temp)}
                                </div>
                                <p className="text-xl text-gray-300 capitalize">
                                    {current.weather[0].description}
                                </p>
                                <p className="text-gray-400">
                                    Feels like {formatTemp(current.feels_like)}
                                </p>
                            </div>
                        </div>

                        {/* Wind */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                <span className="text-gray-400 text-sm">Wind</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {msToKmh(current.wind_speed)} km/h
                            </div>
                            <p className="text-gray-300">{windDir} ({current.wind_deg}°)</p>
                            {current.wind_gust && (
                                <p className="text-orange-400 text-sm mt-1">
                                    Gusts: {msToKmh(current.wind_gust)} km/h
                                </p>
                            )}
                        </div>

                        {/* Humidity */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                                <span className="text-gray-400 text-sm">Humidity</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{current.humidity}%</div>
                            {current.dew_point && (
                                <p className="text-gray-300 text-sm">Dew: {formatTemp(current.dew_point)}</p>
                            )}
                        </div>

                        {/* Pressure */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span className="text-gray-400 text-sm">Pressure</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{current.pressure} hPa</div>
                            <p className="text-gray-300 text-sm">
                                {pressureTrend.icon} {pressureTrend.trend}
                            </p>
                        </div>

                        {/* Visibility */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="text-gray-400 text-sm">Visibility</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {current.visibility ? metersToKm(current.visibility) : '10+'} km
                            </div>
                        </div>

                        {/* Clouds */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                                <span className="text-gray-400 text-sm">Cloud Cover</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{current.clouds}%</div>
                        </div>

                        {/* UV Index */}
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-gray-400 text-sm">UV Index</span>
                            </div>
                            <div className={`text-2xl font-bold ${uvSafety.color}`}>
                                {current.uvi || 0} - {uvSafety.level}
                            </div>
                            <p className="text-gray-300 text-sm">{uvSafety.advice}</p>
                        </div>
                    </div>
                </div>

                {/* Paragliding Specific */}
                <div className="space-y-6">
                    {/* Thermal Forecast */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">🌡️ Thermal Forecast</h3>
                        <div className="text-center mb-4">
                            <div className={`text-4xl font-bold ${thermal.color}`}>
                                {thermal.rating}/10
                            </div>
                            <p className={`${thermal.color} mt-2`}>{thermal.description}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300">
                                <span>Wind Speed:</span>
                                <span className="font-medium">{msToKmh(current.wind_speed)} km/h</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Cloud Cover:</span>
                                <span className="font-medium">{current.clouds}%</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Time:</span>
                                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Flight Window */}
                    {flightWindow.start >= 0 && (
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4">⏰ Best Flying Hours</h3>
                            <div className="text-center">
                                <p className="text-gray-300 mb-2">Today's optimal window:</p>
                                <div className="text-2xl font-bold text-blue-400">
                                    {new Date(hourly[flightWindow.start].dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {new Date(hourly[flightWindow.end].dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <p className="text-gray-400 mt-2">Quality: {flightWindow.quality}</p>
                            </div>
                        </div>
                    )}

                    {/* Air Quality */}
                    {aqi > 0 && (
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4">💨 Air Quality</h3>
                            <div className="text-center">
                                <div className={`text-3xl font-bold ${aqiColors[aqi - 1]}`}>
                                    {aqiLevels[aqi - 1]}
                                </div>
                                <p className="text-gray-400 mt-2">AQI: {aqi}/5</p>
                            </div>
                        </div>
                    )}

                    {/* Sun & Moon */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">☀️ Sun & Moon</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-300">
                                <span>Sunrise:</span>
                                <span className="font-medium">
                                    {new Date(current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Sunset:</span>
                                <span className="font-medium">
                                    {new Date(current.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Moon Phase:</span>
                                <span className="font-medium">{moonPhase.icon} {moonPhase.phase}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hourly Forecast */}
            <div className="max-w-7xl mx-auto mt-6">
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">48-Hour Forecast</h2>
                    <div className="overflow-x-auto">
                        <div className="flex space-x-4 pb-4">
                            {hourly.slice(0, 48).map((hour: any, index: number) => {
                                const date = new Date(hour.dt * 1000);
                                const hourThermal = calculateThermalPotential(
                                    hour.temp,
                                    hour.temp + 2,
                                    hour.wind_speed,
                                    hour.clouds,
                                    date.getHours()
                                );

                                return (
                                    <div
                                        key={index}
                                        className="flex-shrink-0 bg-gray-700 rounded-lg p-4 w-32 text-center"
                                    >
                                        <p className="text-gray-400 text-sm mb-2">
                                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <img
                                            src={getWeatherIconUrl(hour.weather[0].icon)}
                                            alt={hour.weather[0].description}
                                            className="w-12 h-12 mx-auto"
                                        />
                                        <p className="text-xl font-bold text-white">{formatTemp(hour.temp)}</p>
                                        <div className="mt-2 space-y-1 text-xs">
                                            <p className="text-blue-400">
                                                💨 {msToKmh(hour.wind_speed)} km/h
                                            </p>
                                            <p className={hourThermal.color}>
                                                🌡️ {hourThermal.rating}/10
                                            </p>
                                            {hour.pop > 0.3 && (
                                                <p className="text-cyan-400">
                                                    💧 {Math.round(hour.pop * 100)}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Forecast */}
            <div className="max-w-7xl mx-auto mt-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">7-Day Forecast</h2>
                    <div className="space-y-3">
                        {daily.slice(0, 7).map((day: any, index: number) => {
                            const date = new Date(day.dt * 1000);
                            const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });
                            const moon = getMoonPhase(day.moon_phase);

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="w-24">
                                            <p className="font-medium text-white">{dayName}</p>
                                            <p className="text-sm text-gray-400">
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <img
                                            src={getWeatherIconUrl(day.weather[0].icon)}
                                            alt={day.weather[0].description}
                                            className="w-12 h-12"
                                        />
                                        <p className="text-gray-300 capitalize flex-1">{day.weather[0].description}</p>
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400">High/Low</p>
                                            <p className="text-white font-medium">
                                                {formatTemp(day.temp.max)} / {formatTemp(day.temp.min)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400">Wind</p>
                                            <p className="text-blue-400 font-medium">
                                                {msToKmh(day.wind_speed)} km/h
                                            </p>
                                        </div>
                                        {day.pop > 0 && (
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400">Rain</p>
                                                <p className="text-cyan-400 font-medium">
                                                    {Math.round(day.pop * 100)}%
                                                </p>
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400">Moon</p>
                                            <p className="text-xl">{moon.icon}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
