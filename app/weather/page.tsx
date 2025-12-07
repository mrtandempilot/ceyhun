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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading weather data...</p>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Weather</h2>
                    <p className="text-gray-700 mb-6">{state.error}</p>
                    <button
                        onClick={fetchWeather}
                        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
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
        current.temp + 2,
        current.wind_speed,
        current.clouds,
        currentHour
    );

    // Get pressure trend
    const pressureTrend = hourly.length >= 3
        ? formatPressureTrend(current.pressure, hourly[3].pressure)
        : { trend: 'Unknown', icon: '?', description: 'Insufficient data' };

    // Air quality index
    const aqi = air_quality?.list?.[0]?.main?.aqi || 0;
    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiColors = ['text-green-600', 'text-yellow-600', 'text-orange-600', 'text-red-600', 'text-purple-600'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20 px-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            ⛅ Paragliding Weather
                        </h1>
                        <p className="text-gray-600 text-lg">
                            📍 Ölüdeniz, Turkey {state.lastUpdate && `• Updated ${state.lastUpdate.toLocaleTimeString()}`}
                        </p>
                    </div>
                    <button
                        onClick={fetchWeather}
                        disabled={state.loading}
                        className="px-6 py-3 bg-white hover:bg-gray-50 text-purple-600 rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-lg"
                    >
                        <svg className={`w-5 h-5 ${state.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="font-semibold">Refresh</span>
                    </button>
                </div>

                {/* Flight Suitability Alert */}
                <div className={`${flightSuitability.color} rounded-2xl p-6 mb-8 shadow-xl`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Flight Suitability: {flightSuitability.rating}/10
                            </h2>
                            <p className="text-white text-lg">{flightSuitability.description}</p>
                        </div>
                        <div className="text-6xl font-bold text-white opacity-50">
                            {flightSuitability.rating}
                        </div>
                    </div>
                    {flightSuitability.warnings.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {flightSuitability.warnings.map((warning, i) => (
                                <p key={i} className="text-white font-semibold text-lg">{warning}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Weather */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Current Conditions</h2>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Temperature & Weather */}
                        <div className="col-span-2 flex items-center space-x-6">
                            <img
                                src={getWeatherIconUrl(current.weather[0].icon)}
                                alt={current.weather[0].description}
                                className="w-28 h-28"
                            />
                            <div>
                                <div className="text-6xl font-bold text-gray-800">
                                    {formatTemp(current.temp)}
                                </div>
                                <p className="text-2xl text-gray-600 capitalize mt-2">
                                    {current.weather[0].description}
                                </p>
                                <p className="text-gray-500 text-lg mt-1">
                                    Feels like {formatTemp(current.feels_like)}
                                </p>
                            </div>
                        </div>

                        {/* Wind */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                            <div className="flex items-center space-x-2 mb-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                <span className="text-gray-600 font-semibold">Wind</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800">
                                {msToKmh(current.wind_speed)} km/h
                            </div>
                            <p className="text-gray-700 mt-1">{windDir} ({current.wind_deg}°)</p>
                            {current.wind_gust && (
                                <p className="text-orange-600 font-semibold mt-2">
                                    Gusts: {msToKmh(current.wind_gust)} km/h
                                </p>
                            )}
                        </div>

                        {/* Humidity */}
                        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-5">
                            <div className="flex items-center space-x-2 mb-3">
                                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                                <span className="text-gray-600 font-semibold">Humidity</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800">{current.humidity}%</div>
                            {current.dew_point && (
                                <p className="text-gray-700 mt-1">Dew: {formatTemp(current.dew_point)}</p>
                            )}
                        </div>

                        {/* Pressure */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
                            <div className="flex items-center space-x-2 mb-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <span className="text-gray-600 font-semibold">Pressure</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800">{current.pressure} hPa</div>
                            <p className="text-gray-700 mt-1">
                                {pressureTrend.icon} {pressureTrend.trend}
                            </p>
                        </div>

                        {/* Visibility */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5">
                            <div className="flex items-center space-x-2 mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="text-gray-600 font-semibold">Visibility</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800">
                                {current.visibility ? metersToKm(current.visibility) : '10+'} km
                            </div>
                        </div>

                        {/* Clouds */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5">
                            <div className="flex items-center space-x-2 mb-3">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                                <span className="text-gray-600 font-semibold">Cloud Cover</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800">{current.clouds}%</div>
                        </div>

                        {/* UV Index */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5">
                            <div className="flex items-center space-x-2 mb-3">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-gray-600 font-semibold">UV Index</span>
                            </div>
                            <div className={`text-3xl font-bold ${uvSafety.color}`}>
                                {current.uvi || 0} - {uvSafety.level}
                            </div>
                            <p className="text-gray-700 mt-1">{uvSafety.advice}</p>
                        </div>
                    </div>
                </div>

                {/* Paragliding Specific */}
                <div className="space-y-6">
                    {/* Thermal Forecast */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">🌡️ Thermal Forecast</h3>
                        <div className="text-center mb-4">
                            <div className={`text-5xl font-bold ${thermal.color}`}>
                                {thermal.rating}/10
                            </div>
                            <p className={`${thermal.color} mt-3 text-lg font-semibold`}>{thermal.description}</p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span className="font-medium">Wind Speed:</span>
                                <span className="font-bold">{msToKmh(current.wind_speed)} km/h</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span className="font-medium">Cloud Cover:</span>
                                <span className="font-bold">{current.clouds}%</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span className="font-medium">Time:</span>
                                <span className="font-bold">{new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Flight Window */}
                    {flightWindow.start >= 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">⏰ Best Flying Hours</h3>
                            <div className="text-center">
                                <p className="text-gray-600 mb-3 font-medium">Today's optimal window:</p>
                                <div className="text-2xl font-bold text-purple-600">
                                    {new Date(hourly[flightWindow.start].dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {new Date(hourly[flightWindow.end].dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <p className="text-gray-600 mt-3 font-semibold">Quality: {flightWindow.quality}</p>
                            </div>
                        </div>
                    )}

                    {/* Air Quality */}
                    {aqi > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">💨 Air Quality</h3>
                            <div className="text-center">
                                <div className={`text-4xl font-bold ${aqiColors[aqi - 1]}`}>
                                    {aqiLevels[aqi - 1]}
                                </div>
                                <p className="text-gray-600 mt-3 font-medium">AQI: {aqi}/5</p>
                            </div>
                        </div>
                    )}

                    {/* Sun & Moon */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">☀️ Sun & Moon</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span className="font-medium">Sunrise:</span>
                                <span className="font-bold">
                                    {new Date(current.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span className="font-medium">Sunset:</span>
                                <span className="font-bold">
                                    {new Date(current.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            {current.moonrise && (
                                <div className="flex justify-between text-gray-700">
                                    <span className="font-medium">Moonrise:</span>
                                    <span className="font-bold">
                                        {new Date(current.moonrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                            {current.moonset && (
                                <div className="flex justify-between text-gray-700">
                                    <span className="font-medium">Moonset:</span>
                                    <span className="font-bold">
                                        {new Date(current.moonset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-700">
                                <span className="font-medium">Moon Phase:</span>
                                <span className="font-bold">{moonPhase.icon} {moonPhase.phase}</span>
                            </div>
                            {daily[0].moon_illumination && (
                                <div className="flex justify-between text-gray-700">
                                    <span className="font-medium">Illumination:</span>
                                    <span className="font-bold">{daily[0].moon_illumination}%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Temperature Feels */}
                    {(current.wind_chill !== current.temp || current.heat_index !== current.temp) && (
                        <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">🌡️ Temperature Feels</h3>
                            <div className="space-y-3">
                                {current.wind_chill && current.wind_chill < current.temp && (
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Wind Chill:</span>
                                        <span className="font-bold text-blue-600">{formatTemp(current.wind_chill)}</span>
                                    </div>
                                )}
                                {current.heat_index && current.heat_index > current.temp && (
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Heat Index:</span>
                                        <span className="font-bold text-orange-600">{formatTemp(current.heat_index)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-700">
                                    <span className="font-medium">Actual Temp:</span>
                                    <span className="font-bold">{formatTemp(current.temp)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Precipitation */}
                    {(current.precip_mm > 0 || daily[0].totalprecip_mm > 0) && (
                        <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">💧 Precipitation</h3>
                            <div className="space-y-3">
                                {current.precip_mm > 0 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Current:</span>
                                        <span className="font-bold text-cyan-600">{current.precip_mm} mm</span>
                                    </div>
                                )}
                                {daily[0].totalprecip_mm > 0 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Today Total:</span>
                                        <span className="font-bold text-cyan-600">{daily[0].totalprecip_mm} mm</span>
                                    </div>
                                )}
                                {daily[0].will_it_rain === 1 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Rain Chance:</span>
                                        <span className="font-bold text-blue-600">{daily[0].chance_of_rain}%</span>
                                    </div>
                                )}
                                {daily[0].will_it_snow === 1 && (
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-medium">Snow Chance:</span>
                                        <span className="font-bold text-purple-600">{daily[0].chance_of_snow}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hourly Forecast */}
            <div className="max-w-7xl mx-auto mt-8">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">48-Hour Forecast</h2>
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
                                        className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 w-36 text-center shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <p className="text-gray-600 font-semibold mb-3">
                                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <img
                                            src={getWeatherIconUrl(hour.weather[0].icon)}
                                            alt={hour.weather[0].description}
                                            className="w-14 h-14 mx-auto"
                                        />
                                        <p className="text-2xl font-bold text-gray-800 mt-2">{formatTemp(hour.temp)}</p>
                                        <div className="mt-3 space-y-1 text-sm">
                                            <p className="text-blue-600 font-semibold">
                                                💨 {msToKmh(hour.wind_speed)} km/h
                                            </p>
                                            <p className={`${hourThermal.color} font-semibold`}>
                                                🌡️ {hourThermal.rating}/10
                                            </p>
                                            {hour.pop > 0.3 && (
                                                <p className="text-cyan-600 font-semibold">
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
            <div className="max-w-7xl mx-auto mt-8 mb-8">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">7-Day Forecast</h2>
                    <div className="space-y-4">
                        {daily.slice(0, 7).map((day: any, index: number) => {
                            const date = new Date(day.dt * 1000);
                            const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' });
                            const moon = getMoonPhase(day.moon_phase);

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center space-x-6 flex-1">
                                        <div className="w-32">
                                            <p className="font-bold text-gray-800 text-lg">{dayName}</p>
                                            <p className="text-gray-600">
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <img
                                            src={getWeatherIconUrl(day.weather[0].icon)}
                                            alt={day.weather[0].description}
                                            className="w-14 h-14"
                                        />
                                        <p className="text-gray-700 capitalize flex-1 font-medium">{day.weather[0].description}</p>
                                    </div>

                                    <div className="flex items-center space-x-8">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 font-medium">High/Low</p>
                                            <p className="text-gray-800 font-bold text-lg">
                                                {formatTemp(day.temp.max)} / {formatTemp(day.temp.min)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 font-medium">Wind</p>
                                            <p className="text-blue-600 font-bold text-lg">
                                                {msToKmh(day.wind_speed)} km/h
                                            </p>
                                        </div>
                                        {day.pop > 0 && (
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600 font-medium">Rain</p>
                                                <p className="text-cyan-600 font-bold text-lg">
                                                    {Math.round(day.pop * 100)}%
                                                </p>
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 font-medium">Moon</p>
                                            <p className="text-3xl">{moon.icon}</p>
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
