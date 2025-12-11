'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu, X, Check, Star, MessageCircle, Users, Calendar,
  Globe, BarChart3, Zap, Shield, Clock, Phone, Mail,
  MapPin, Facebook, Instagram, Twitter, ChevronDown, ChevronUp,
  Bot, Brain, Cpu, Sparkles, ArrowRight, Play, Layers,
  Database, Wifi, Radio, Eye, Target, TrendingUp
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [particles, setParticles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    modules: []
  });

  // Generate floating particles for AI effect
  useEffect(() => {
    const numParticles = 20;
    const newParticles = Array.from({ length: numParticles }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 4 + 2,
    }));
    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.vx + 100) % 100,
        y: (p.y + p.vy + 100) % 100,
      })));
    };
    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  const modules = [
    {
      icon: <Bot className="w-8 h-8" />,
      name: 'AI Sohbet Botu',
      benefit: 'Uyumayan nöral sohbetler',
      features: ['İçerik farkında yanıtlar', 'Çoklu dil desteği', 'Öğrenme sistemi'],
      price: '₺2,500-3,500/ay',
      aiBadge: true
    },
    {
      icon: <Brain className="w-8 h-8" />,
      name: 'CRM Zekası',
      benefit: 'Yapay zeka odaklı müşteri içgörüleri',
      features: ['Tahmini analitik', 'Akıllı segmentasyon', 'Otomatik öneriler'],
      price: '₺3,000-4,500/ay',
      aiBadge: true
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      name: 'Akıllı Rezervasyon Motoru',
      benefit: 'Algoritma odaklı rezervasyon sistemi',
      features: ['Dinamik fiyatlandırma', 'Talep tahmini', 'Otomatik optimizasyon'],
      price: '₺4,000-6,000/ay',
      aiBadge: true
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      name: 'Sosyal Otomatik Yanıt',
      benefit: 'Çoklu platformda otomatik yanıt',
      features: [
        <>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">f</div>
            <span className="text-xs text-blue-400">Facebook</span>
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg"></div>
            <span className="text-xs text-purple-400">Instagram</span>
            <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.633 2.573c0-.781-.636-1.413-1.42-1.413-.417 0-.835.166-1.135.46-4.198 4.177-10.033 4.177-14.227 0-.25-.25-.672-.41-1.09-.41-.782 0-1.418.632-1.418 1.413C3.5 7.714 7.667 11.83 15.506 22.124l1.494-1.495c-7.42-10.263-11.58-14.367-11.58-18.056z"/></svg>
            </div>
            <span className="text-xs text-blue-400">Twitter</span>
            <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.507 14.307l-.009.075c-2.199.895-7.875 1.904-9.927 2.021l-.166.009c-1.775 0-1.831-.634-1.83-1.128.001-.896.542-1.695 1.327-2.604-.466-.110-.843-.297-.843-.704 0-.114.033-.14.02-.27l.005.036c.008.085-.002-.045.005-.036l.026-.229c.114-.95.73-1.937 1.596-3.323-.793-.492-1.257-1.368-1.257-2.43 0-1.83 1.484-3.319 3.312-3.319.76 0 1.516.335 2.1.883.582-.13.47-.37.491-.496.011-.07-.028-.156-.028-.156 0-1.74 1.078-3.111 2.811-3.111 1.435 0 2.336.649 2.774 1.732.438-.129.97-.261 1.029-.261.143 0 .211.089.23.209.033.169-.068.467-.068.467l-.005.036c-.005-.078.005-.036-.005-.036l-.026.229c.114.95.73 1.937 1.596 3.323-.793.492-1.257 1.368-1.257 2.43 0 1.502.871 2.658 2.127 3.307C19.069 12.99 19.134 13.779 17.507 14.307zM13.03 3.903c-.83 0-1.502.673-1.502 1.503 0 .83.672 1.502 1.502 1.502.83 0 1.502-.673 1.502-1.502 0-.83-.672-1.503-1.502-1.503zm-5.055 3.188c-.483 0-.875.392-.875.874 0 .483.392.875.875.875.482 0 .874-.392.874-.875s-.392-.874-.874-.874zm11.055 0c-.482 0-.875.392-.875.874 0 .483.393.875.875.875.482 0 .874-.392.874-.875 0-.482-.392-.874-.874-.874z"/></svg>
            </div>
            <span className="text-xs text-green-400">WhatsApp</span>
          </div>
          <div>Çoklu platformda otomatik yanıt • Cümle analizi</div>
        </>,
        <>
          ⏰ <span className="text-cyan-400 font-semibold">“Canlı Destek Bizde Kalır”</span>
          <div className="text-xs text-slate-400 mt-1">Müşteriye erişim veriyoruz, canlı destek tamamen biz yönetiyoruz</div>
        </>,
        <>
          📞 <span className="text-purple-400 font-semibold">“Rezervasyon Asistanı Aktif”</span>
          <div className="text-xs text-slate-400 mt-1">Rezervasyon işlemleri ve canlı sohbet desteği bizim kontrolümüzde</div>
        </>
      ],
      price: '₺2,000-3,000/ay',
      aiBadge: true
    },
    {
      icon: <Layers className="w-8 h-8" />,
      name: 'Web Site Oluşturucu',
      benefit: 'Dönüşüm yapan güzel web siteleri',
      features: ['SEO optimizasyonu', 'Dinamik içerik', 'Mobil uyumlu tasarım'],
      price: '₺3,500-5,500/ay',
      aiBadge: false
    },
    {
      icon: <Database className="w-8 h-8" />,
      name: 'Analitik AI Dashboard',
      benefit: 'Tahmini iş zekası analizi',
      features: ['Gelir tahmini', 'Müşteri değeri', 'Trend analizi'],
      price: '₺2,500-4,000/ay',
      aiBadge: true
    }
  ];

  const testimonials = [
    {
      name: 'Mehmet Yılmaz',
      agency: 'Ölüdeniz Adventures',
      quote: 'AI sohbet botu bize günlük 15 saat kazandırdı. Türk kültürünü mükemmel anlıyor.',
      rating: 5,
      avatar: 'M'
    },
    {
      name: 'Ayşe Demir',
      agency: 'Fethiye Blue Tours',
      quote: 'Tahmini fiyatlandırma geliri %35 artırdı. AI artık bizim gizli silahımız.',
      rating: 5,
      avatar: 'A'
    },
    {
      name: 'Can Öztürk',
      agency: 'Babadağ Paragliding',
      quote: 'Turizmde böyle bir teknoloji hiç görmedim. Nöral ağ inanılmaz.',
      rating: 5,
      avatar: 'C'
    }
  ];

  const aiFeatures = [
    { icon: <Sparkles />, title: 'Kendi Kendine Öğrenen', desc: 'Etkileşimlerden sürekli iyileşiyor' },
    { icon: <TrendingUp />, title: 'Tahmini Güç', desc: 'Müşteri ihtiyaçlarını önceden tahmin ediyor' },
    { icon: <Eye />, title: '7/24 Görüş', desc: 'Hiçbir fırsatı kaçırmıyor' },
    { icon: <Target />, title: 'Kesin Hedefleme', desc: 'AI eşleşmeli öneriler' }
  ];

  const faqs = [
    {
      question: 'AI benim işim hakkında nasıl öğreniyor?',
      answer: 'Nöral ağlarımız geçmiş verilerinizi, müşteri etkileşimlerinizi ve piyasa eğilimlerini analiz ederek performans ve doğruluk açısından sürekli iyileşir.'
    },
    {
      question: 'AI Türk turizmi için güvenli ve güvenilir mi?',
      answer: 'Kesinlikle. Yerel Türk turizm verileri üzerinde eğitilir, kültürel bağlamı anlar ve endüstri kalite güvenlik ve uyumluluk standartlarıyla inşa edilir.'
    },
    {
      question: 'AI hata yaparsa ne olur?',
      answer: 'Yerleşik insan gözetimi ve düzeltme mekanizmaları. AI düzeltmelerden öğrenerek benzer sorunları önler. Her zaman son kontrol sizde kalır.'
    },
    {
      question: 'AI uygulama için kurulum süresi?',
      answer: 'Veri analizi, nöral ağ eğitimi ve entegrasyon testi dahil 2-4 hafta. Performansı izlerken her şeyi biz hallederiz.'
    }
  ];

  const stats = [
    { number: '99.8%', label: 'AI Doğruluk', desc: 'Nöral hassasiyet' },
    { number: '15saat', label: 'Günlük Tasarruf', desc: 'Otomatik yanıtlar' },
    { number: '35%', label: 'Gelir Artışı', desc: 'Tahmini fiyatlandırma' },
    { number: '7/24', label: 'Uygunluk', desc: 'Asla uyumaz' }
  ];

  const handleFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        modules: checked
          ? [...prev.modules, value]
          : prev.modules.filter(m => m !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log('Demo requested:', formData);
    alert('AI Gösterim Talebi Alındı! Nöral ağ eğitimi 24 saat içinde başlayacak.');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Particles Background */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-60"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <Brain className="relative w-10 h-10 text-white p-2 bg-black rounded-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  TourFlow AI
                </h1>
                <p className="text-xs text-cyan-400 -mt-1">Neural Tourism Tech</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#ozellikler" className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium">
                AI Özellikleri
              </a>
              <a href="#moduller" className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium">
                Neural Modüller
              </a>
              <a href="#fiyatlandirma" className="text-gray-300 hover:text-cyan-400 transition-all duration-300 font-medium">
                Fiyatlandırma
              </a>
              <a href="#gosterim" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transform hover:scale-105 transition-all duration-300">
                Neural Demo
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-cyan-500/20 transition-colors"
              aria-label="Menüyü aç/kapat">
              {mobileMenuOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6 text-cyan-400" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-4 mt-2 bg-black/90 backdrop-blur-xl rounded-3xl mx-2 mb-2 border border-cyan-500/20">
              <div className="px-3 space-y-1">
                <a href="#ozellikler" className="block py-3 px-4 hover:bg-cyan-500/20 rounded-full transition-all duration-300 text-gray-300 hover:text-cyan-400 font-medium">
                  AI Özellikleri
                </a>
                <a href="#moduller" className="block py-3 px-4 hover:bg-cyan-500/20 rounded-full transition-all duration-300 text-gray-300 hover:text-cyan-400 font-medium">
                  Neural Modüller
                </a>
                <a href="#fiyatlandirma" className="block py-3 px-4 hover:bg-cyan-500/20 rounded-full transition-all duration-300 text-gray-300 hover:text-cyan-400 font-medium">
                  Fiyatlandırma
                </a>
                <a href="#gosterim" className="block py-3 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full transition-all duration-300 font-semibold text-center">
                  Neural Demo
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-full mb-6">
                <Sparkles className="w-5 h-5 text-cyan-400 mr-2" />
                <span className="text-cyan-400 font-semibold text-sm tracking-wide">NEURAL TURİZM ZEKASI</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">
              <div className="text-white">Turizmi bilen yapay zeka</div>
              <div className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                satışları tamamen otomatik yapar.
              </div>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
              Nöral ağlarımız müşteri ihtiyaçlarını önceden tahmin eder, tüm satış sürecini kendi yürütür. 7/24 canlı müşteri hizmetleri dahil… Siz hiçbir şey yapmayın, her şeyi biz hallediyoruz.
            </p>

            <p className="text-base text-cyan-400 italic mb-8 font-mono">
              Yapay Zeka • Nöral Ağlar • Akıllı Otomasyon
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href="#gosterim"
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/60 transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 group">
                <Brain className="w-5 h-5 group-hover:animate-pulse" />
                Neural Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#moduller"
                className="px-8 py-3 border-2 border-cyan-500/50 text-cyan-400 rounded-xl font-semibold text-lg hover:bg-cyan-500/10 hover:border-cyan-400 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <Eye className="w-5 h-5" />
                Keşfet
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-black/50 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all duration-300 transform hover:scale-105">
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-cyan-400 font-bold text-sm uppercase tracking-wide">{stat.label}</div>
                  <div className="text-gray-500 text-xs mt-1">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* AI Features Section */}
        <section id="ozellikler" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Nöral Zeka Bizde Kalır
                </span>
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Tüm AI teknolojisi tamamen bizim kontrolümüz altındadır. Müşteriye erişim veriyoruz, ancak her şey biz yönetiyoruz.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {aiFeatures.map((feature, idx) => (
                <div key={idx} className="group bg-black/30 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 hover:border-cyan-400/50 hover:bg-black/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Our Service Model */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-700 rounded-3xl p-8 group hover:border-cyan-400/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Siz Hiçbir Şey Yapmıyorsunuz</h3>
                    <p className="text-slate-400 text-sm">Her şeyi biz hallediyoruz</p>
                  </div>
                </div>

                <div className="space-y-3 text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div><strong>Canlı Destek:</strong> %100 bizim kontrolümüzde</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div><strong>Rezervasyonlar:</strong> Ayarlanmış ve onaylanmış</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div><strong>Kurulum:</strong> Sadece 2-4 hafta</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-700 rounded-3xl p-8 group hover:border-cyan-400/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a7 7 0 00.01 0H5a6 6 0 00-6-6v9m12-11H9m0 0V5a2 2 0 012-2h4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Gelir Artışınız</h3>
                    <p className="text-slate-400 text-sm">Tahmini %35 artış</p>
                  </div>
                </div>

                <div className="space-y-3 text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div><strong>Otomatik İşlemler:</strong> 15+ saatte günlük</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div><strong>Fiyatlandırma:</strong> Dinamik yayımlama</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div><strong>İndirimli Paket:</strong> 3+ modül devreye alındı</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modules Grid */}
        <section id="moduller" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                AI <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Modülleri</span>
                <br />
                <span className="text-lg text-gray-300 font-normal">Türk seyahat acenteleri için modüler nöral ağlar</span>
              </h2>
              <p className="text-cyan-400 italic text-sm font-mono mt-2">Sadece ihtiyacınızı alın</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.map((module, idx) => (
                <div key={idx} className="group bg-gradient-to-br from-slate-900 to-black border border-slate-700 rounded-2xl p-6 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                  {/* AI Badge */}
                  {module.aiBadge && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      NEURAL
                    </div>
                  )}

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <div className="text-white">{module.icon}</div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{module.name}</h3>

                    <p className="text-cyan-400 text-sm font-medium mb-4 leading-relaxed">{module.benefit}</p>

                    <ul className="space-y-2 mb-6">
                      {module.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-400 text-xs">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-xl font-bold text-cyan-400 mb-3">{module.price}</p>
                      <a href="#gosterim"
                        className="block w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm">
                        Aktive Et
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bundle AI Incentive */}
            <div className="mt-12 p-12 bg-gradient-to-r from-purple-900/50 via-cyan-900/50 to-purple-900/50 backdrop-blur-sm rounded-3xl border border-cyan-500/30 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Brain className="w-12 h-12 text-cyan-400" />
                <h3 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Kuantum Paket
                </h3>
              </div>
              <p className="text-xl text-white mb-2">
                3+ AI modülü kombinasyonu ile gelişmiş nöral çapraz eğitimi kilitle
              </p>
              <p className="text-cyan-400 text-lg font-mono italic">
                3+ modül • %25 indirim • gelişmiş nöral entegrasyon
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-white mb-4">
                Nöral Başarı <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Hikayeleri</span>
              </h2>
              <p className="text-xl text-gray-300">AI zeka tarafından dönüştürülen Türk acenteleri</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-black/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 hover:border-cyan-400/50 transition-all duration-300">
                  <div className="flex mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{testimonial.name}</h4>
                      <p className="text-cyan-400 text-sm">{testimonial.agency}</p>
                    </div>
                  </div>

                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-gray-300 mb-3 leading-relaxed">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="fiyatlandirma" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-slate-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-white mb-4">
                Fiyatlandırma
              </h2>
              <p className="text-xl text-gray-300 mb-4">Kendini geri ödeyen nöral AI</p>
              <p className="text-cyan-400 font-mono italic">Girdiğiniz kadar çıktı alırsınız</p>
            </div>

            <div className="bg-black/50 backdrop-blur-sm border border-slate-700 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-cyan-600 to-purple-600">
                    <tr>
                      <th className="px-8 py-6 text-left text-white text-lg font-bold">
                        Nöral Modül
                      </th>
                      <th className="px-8 py-6 text-left text-white text-lg font-bold">
                        Zeka Seviyesi
                      </th>
                      <th className="px-8 py-6 text-left text-white text-lg font-bold">
                        Aylık Nöral Ücret
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {modules.map((module, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-6 font-bold text-white flex items-center">
                          <div className="mr-4">{module.icon}</div>
                          <div>
                            <div>{module.name}</div>
                            {module.aiBadge && <div className="text-xs text-cyan-400 font-mono">NÖRAL</div>}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-cyan-400">Gelişmiş AI</td>
                        <td className="px-8 py-6 font-black text-cyan-400 text-lg">{module.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-400 mb-4">
                ✨ <span className="font-bold text-cyan-400">Tüm AI modülleri şunları içerir:</span>
                Nöral eğitim, Türkçe veriler, tahmini optimizasyon, 7/24 izleme
              </p>
              <p className="text-slate-500 font-mono text-sm">Kurulum ve eğitim ücretsiz • Veri güvenliği garanti</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-white mb-4">
                Sıkça Sorulan <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Sorular</span>
              </h2>
              <p className="text-xl text-gray-300">AI uygulama hakkında bilgi edinin</p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-black/30 backdrop-blur-sm border border-slate-700 rounded-2xl hover:border-cyan-400/50 transition-all duration-300 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                    aria-expanded={expandedFaq === idx}>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{faq.question}</h3>
                    </div>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-6 h-6 text-cyan-400 flex-shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-slate-400 flex-shrink-0 ml-4" />
                    )}
                  </button>

                  {expandedFaq === idx && (
                    <div className="px-8 pb-6">
                      <p className="text-gray-300 mb-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Neural Demo Form */}
        <section id="gosterim" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900 via-black to-slate-900 border border-cyan-500/30 rounded-3xl overflow-hidden relative">
              {/* Neural Network Animation Overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <path d="M50,100 Q100,50 150,100 T250,100 Q300,150 350,100"
                        stroke="cyan" strokeWidth="1" fill="none" opacity="0.6">
                    <animate attributeName="stroke-dasharray" values="0,100%;100%,0" dur="4s" repeatCount="indefinite"/>
                  </path>
                  <circle cx="50" cy="100" r="3" fill="cyan" opacity="0.8">
                    <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="150" cy="100" r="3" fill="purple" opacity="0.8">
                    <animate attributeName="r" values="6;3;6" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                  </circle>
                  <circle cx="250" cy="100" r="3" fill="cyan" opacity="0.8">
                    <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin="1s"/>
                  </circle>
                  <circle cx="350" cy="100" r="3" fill="purple" opacity="0.8">
                    <animate attributeName="r" values="6;3;6" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                  </circle>
                </svg>
              </div>

              <div className="grid lg:grid-cols-2 relative z-10">
                {/* Left - Form */}
                <div className="p-8 lg:p-12 bg-black/50">
                  <div className="mb-6">
                    <Brain className="w-16 h-16 text-cyan-400 mb-4" />
                    <h2 className="text-4xl font-black text-white mb-3">
                      Nöral Demo Talebi
                    </h2>
                    <p className="text-gray-300 mb-2">Acentanızı dönüştüren AI zekasını deneyimleyin</p>
                    <p className="text-sm text-cyan-400 italic font-mono">
                      30 dakikalık ücretsiz nöral gösterim talebi
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-cyan-400 mb-2">
                        Acente Adı *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all text-white placeholder:text-slate-500"
                        placeholder="Ölüdeniz Adventures"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-bold text-cyan-400 mb-2">
                      WhatsApp / Telefon *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all text-white placeholder:text-slate-500"
                        placeholder="+905555555555"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-cyan-400 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all text-white placeholder:text-slate-500"
                        placeholder="info@tourflow.ai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-cyan-400 mb-3">
                        İlginizi Çeken Modüller
                      </label>
                      <div className="space-y-3">
                        {modules.filter(m => m.aiBadge).slice(0, 4).map((module, idx) => (
                          <label key={idx} className="flex items-center space-x-3 cursor-pointer group hover:bg-slate-800/30 p-3 rounded-lg transition-all">
                            <input
                              type="checkbox"
                              name="modules"
                              value={module.name}
                              onChange={handleFormChange}
                              className="w-5 h-5 rounded bg-slate-800 border-2 border-slate-600 text-cyan-500 focus:ring-2 focus:ring-cyan-400/30 cursor-pointer"
                            />
                            <span className="text-white group-hover:text-cyan-400 transition-colors flex items-center">
                              <span className="mr-3 text-cyan-400">{module.icon}</span>
                              {module.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black text-lg shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 rounded-xl flex items-center justify-center gap-3 group">
                      <Sparkles className="w-6 h-6 group-hover:animate-spin" />
                      Nöral Demo Sırasını Başlat
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>

                    <p className="text-xs text-slate-500 text-center font-mono">
                      Nöral eğitim 24 saat içinde başlar
                    </p>
                  </form>
                </div>

                {/* Right - Neural Benefits */}
                <div className="p-8 lg:p-12 text-white bg-gradient-to-br from-black via-slate-900 to-black">
                  <h3 className="text-3xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    Nöral Kapasiteler
                  </h3>
                  <ul className="space-y-6">
                    {[
                      { icon: <Eye className="w-8 h-8 text-cyan-400" />, title: 'Tahmini Görüş', desc: 'Müşteri ihtiyaçlarını ortaya çıkmadan önce tahmin eder' },
                      { icon: <Zap className="w-8 h-8 text-purple-400" />, title: 'Anlık Öğrenme', desc: 'Nöral ağlar işinizle birlikte gelişir' },
                      { icon: <Target className="w-8 h-8 text-green-400" />, title: 'Kesin Hedefleme', desc: 'AI eşleşmeli öneriler ve fiyatlandırma' },
                      { icon: <Database className="w-8 h-8 text-orange-400" />, title: 'Veri Zekası', desc: 'Türkiye\'ye özel içgörüler ve analitik' },
                      { icon: <Shield className="w-8 h-8 text-blue-400" />, title: 'Güvenli Ağlar', desc: 'Kurumsal sınıf güvenlik ve uyumluluk' }
                    ].map((benefit, idx) => (
                      <li key={idx} className="flex items-start space-x-4 group">
                        <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-slate-700 transition-colors">
                          {benefit.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{benefit.title}</h4>
                          <p className="text-slate-400 text-sm">{benefit.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-12 p-6 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl border border-cyan-500/20">
                    <p className="text-sm opacity-90">
                      📱 <span className="font-bold text-cyan-400">Doğrudan Nöral Bağlantı:</span>{' '}
                      <a href="https://wa.me/905551234567"
                        className="font-bold underline hover:text-purple-400 transition-colors">
                        WhatsApp +90 555 123 4567
                      </a>
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-mono">
                      7/24 nöral destek • Gerçek zamanlı AI yanıtları
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <Brain className="w-12 h-12 text-cyan-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">TourFlow AI</h1>
                  <p className="text-xs text-cyan-400">Neural Tourism Solutions</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Türk seyahat acenteleri için gelişmiş AI. Yerel turizm verileri üzerinde eğitilmiş nöral ağlar.
              </p>
            </div>

            {/* AI Tech */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Nöral Teknoloji</h4>
              <ul className="space-y-2">
                <li><a href="#ozellikler" className="text-slate-400 hover:text-cyan-400 transition-colors">AI Özellikleri</a></li>
                <li><a href="#moduller" className="text-slate-400 hover:text-cyan-400 transition-colors">Nöral Modüller</a></li>
                <li><a href="#fiyatlandirma" className="text-slate-400 hover:text-cyan-400 transition-colors">Zeka Modelleri</a></li>
                <li><a href="#gosterim" className="text-slate-400 hover:text-cyan-400 transition-colors">Canlı Demo</a></li>
              </ul>
            </div>

            {/* Turkish Support */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Türkiye Desteği</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-cyan-400" />
                  <a href="tel:+905551234567" className="text-slate-400 hover:text-cyan-400 transition-colors">
                    +90 555 123 4567
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  <a href="mailto:ai@tourflow.com" className="text-slate-400 hover:text-cyan-400 transition-colors">
                    ai@tourflow.com
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span className="text-slate-400">Fethiye, Muğla, Türkiye</span>
                </li>
              </ul>
            </div>

            {/* Social Neural Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Nöral Ağ</h4>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-700 hover:from-cyan-500 hover:to-purple-600 rounded-xl flex items-center justify-center transition-all transform hover:scale-110">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-700 hover:from-pink-500 hover:to-purple-600 rounded-xl flex items-center justify-center transition-all transform hover:scale-110">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-700 hover:from-cyan-500 hover:to-blue-600 rounded-xl flex items-center justify-center transition-all transform hover:scale-110">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Neural Atmosphere Effect */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default LandingPage;
