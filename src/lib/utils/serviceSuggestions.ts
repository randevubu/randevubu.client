import { BusinessType } from '../../types/business';
import { CreateServiceData } from '../../types/service';

export interface ServiceSuggestion {
  name: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
}

export const getSuggestedServicesForBusinessType = (businessType: BusinessType | string | { id: string; name: string; displayName: string; icon?: string; category: string }): ServiceSuggestion[] => {
  const businessTypeId = typeof businessType === 'string' ? businessType : businessType.id;
  
  const suggestions: Record<string, ServiceSuggestion[]> = {
    // Beauty & Wellness
    'hair_salon': [
      {
        name: 'Saç Kesimi ve Şekillendirme',
        description: 'Profesyonel saç kesimi ve şekillendirme hizmeti',
        duration: 60,
        price: 150,
        currency: 'TRY'
      },
      {
        name: 'Saç Boyama',
        description: 'Saç boyama ve renklendirme hizmeti',
        duration: 120,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Saç Bakımı',
        description: 'Saç yıkama, bakım ve şekillendirme',
        duration: 90,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Saç Uzatma',
        description: 'Saç uzatma ve ekleme hizmeti',
        duration: 180,
        price: 500,
        currency: 'TRY'
      }
    ],
    
    'barber_shop': [
      {
        name: 'Saç Kesimi',
        description: 'Erkek saç kesimi ve şekillendirme',
        duration: 45,
        price: 100,
        currency: 'TRY'
      },
      {
        name: 'Sakal Düzenleme',
        description: 'Sakal kesimi ve şekillendirme',
        duration: 30,
        price: 60,
        currency: 'TRY'
      },
      {
        name: 'Saç Yıkama',
        description: 'Saç yıkama ve bakım',
        duration: 20,
        price: 40,
        currency: 'TRY'
      },
      {
        name: 'Saç Kesimi + Sakal',
        description: 'Saç kesimi ve sakal düzenleme paketi',
        duration: 60,
        price: 140,
        currency: 'TRY'
      }
    ],
    
    'beauty_salon': [
      {
        name: 'Makyaj',
        description: 'Günlük ve özel gün makyajı',
        duration: 90,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Kaş Dizaynı',
        description: 'Kaş şekillendirme ve düzenleme',
        duration: 45,
        price: 80,
        currency: 'TRY'
      },
      {
        name: 'Yüz Bakımı',
        description: 'Profesyonel yüz temizleme ve bakım',
        duration: 90,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Epilasyon',
        description: 'Vücut epilasyon hizmeti',
        duration: 60,
        price: 150,
        currency: 'TRY'
      }
    ],
    
    'nail_salon': [
      {
        name: 'Manikür',
        description: 'El bakımı ve oje uygulaması',
        duration: 60,
        price: 120,
        currency: 'TRY'
      },
      {
        name: 'Pedikür',
        description: 'Ayak bakımı ve oje uygulaması',
        duration: 75,
        price: 150,
        currency: 'TRY'
      },
      {
        name: 'Nail Art',
        description: 'Tırnak sanatı ve dekorasyon',
        duration: 90,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Gel Manikür',
        description: 'Gel oje uygulaması',
        duration: 90,
        price: 180,
        currency: 'TRY'
      }
    ],
    
    'spa_wellness': [
      {
        name: 'Masaj Terapisi',
        description: 'Rahatlama ve stres giderme masajı',
        duration: 60,
        price: 250,
        currency: 'TRY'
      },
      {
        name: 'Yüz Bakımı',
        description: 'Profesyonel yüz temizleme ve bakım',
        duration: 90,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Vücut Peeling',
        description: 'Vücut peeling ve nemlendirme',
        duration: 75,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Aromaterapi',
        description: 'Aromaterapi ile rahatlama seansı',
        duration: 45,
        price: 180,
        currency: 'TRY'
      }
    ],
    
    'massage_therapy': [
      {
        name: 'Rahatlama Masajı',
        description: 'Genel rahatlama ve stres giderme masajı',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Terapötik Masaj',
        description: 'Kas ağrıları için terapötik masaj',
        duration: 75,
        price: 250,
        currency: 'TRY'
      },
      {
        name: 'Spor Masajı',
        description: 'Sporcular için özel masaj terapisi',
        duration: 90,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Refleksoloji',
        description: 'Ayak refleksoloji masajı',
        duration: 45,
        price: 150,
        currency: 'TRY'
      }
    ],
    
    // Health & Medical
    'dental_clinic': [
      {
        name: 'Diş Temizliği',
        description: 'Profesyonel diş temizliği ve bakım',
        duration: 45,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Diş Dolgusu',
        description: 'Diş çürüğü dolgu işlemi',
        duration: 60,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'Diş Muayenesi',
        description: 'Genel diş sağlığı kontrolü',
        duration: 30,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Diş Beyazlatma',
        description: 'Profesyonel diş beyazlatma işlemi',
        duration: 90,
        price: 800,
        currency: 'TRY'
      }
    ],
    
    'medical_clinic': [
      {
        name: 'Genel Muayene',
        description: 'Genel sağlık kontrolü ve muayene',
        duration: 30,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Kan Tahlili',
        description: 'Kan tahlili ve laboratuvar testleri',
        duration: 15,
        price: 150,
        currency: 'TRY'
      },
      {
        name: 'Aşı Uygulaması',
        description: 'Aşı uygulama ve takip',
        duration: 20,
        price: 100,
        currency: 'TRY'
      },
      {
        name: 'Uzman Konsültasyonu',
        description: 'Uzman doktor konsültasyonu',
        duration: 45,
        price: 300,
        currency: 'TRY'
      }
    ],
    
    'physiotherapy': [
      {
        name: 'Fizik Tedavi',
        description: 'Kas ve eklem ağrıları için fizik tedavi',
        duration: 60,
        price: 250,
        currency: 'TRY'
      },
      {
        name: 'Manuel Terapi',
        description: 'Manuel terapi ve masaj teknikleri',
        duration: 45,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Egzersiz Terapisi',
        description: 'Kişiye özel egzersiz programı',
        duration: 60,
        price: 180,
        currency: 'TRY'
      },
      {
        name: 'Elektroterapi',
        description: 'Elektrik akımları ile tedavi',
        duration: 30,
        price: 150,
        currency: 'TRY'
      }
    ],
    
    'veterinary': [
      {
        name: 'Genel Muayene',
        description: 'Evcil hayvan genel sağlık kontrolü',
        duration: 30,
        price: 150,
        currency: 'TRY'
      },
      {
        name: 'Aşı Uygulaması',
        description: 'Evcil hayvan aşı uygulaması',
        duration: 20,
        price: 100,
        currency: 'TRY'
      },
      {
        name: 'Tırnak Kesimi',
        description: 'Evcil hayvan tırnak bakımı',
        duration: 15,
        price: 50,
        currency: 'TRY'
      },
      {
        name: 'Kontrol ve Takip',
        description: 'Hastalık takibi ve kontrol',
        duration: 45,
        price: 200,
        currency: 'TRY'
      }
    ],
    
    // Professional Services
    'legal_services': [
      {
        name: 'Hukuki Danışmanlık',
        description: 'Genel hukuki danışmanlık hizmeti',
        duration: 60,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'Sözleşme İnceleme',
        description: 'Sözleşme inceleme ve değerlendirme',
        duration: 90,
        price: 800,
        currency: 'TRY'
      },
      {
        name: 'Dava Takibi',
        description: 'Hukuki dava süreci takibi',
        duration: 45,
        price: 600,
        currency: 'TRY'
      },
      {
        name: 'Noter İşlemleri',
        description: 'Noter işlemleri ve belgelendirme',
        duration: 30,
        price: 300,
        currency: 'TRY'
      }
    ],
    
    'financial_advisory': [
      {
        name: 'Mali Danışmanlık',
        description: 'Kişisel ve kurumsal mali danışmanlık',
        duration: 60,
        price: 400,
        currency: 'TRY'
      },
      {
        name: 'Yatırım Planlaması',
        description: 'Yatırım stratejisi ve planlama',
        duration: 90,
        price: 600,
        currency: 'TRY'
      },
      {
        name: 'Vergi Danışmanlığı',
        description: 'Vergi planlaması ve danışmanlık',
        duration: 45,
        price: 350,
        currency: 'TRY'
      },
      {
        name: 'Emeklilik Planlaması',
        description: 'Emeklilik ve gelecek planlaması',
        duration: 60,
        price: 500,
        currency: 'TRY'
      }
    ],
    
    'consulting': [
      {
        name: 'İş Danışmanlığı',
        description: 'İş geliştirme ve strateji danışmanlığı',
        duration: 60,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Pazarlama Danışmanlığı',
        description: 'Pazarlama stratejisi ve danışmanlık',
        duration: 90,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'İnsan Kaynakları',
        description: 'İK süreçleri ve danışmanlık',
        duration: 60,
        price: 400,
        currency: 'TRY'
      },
      {
        name: 'Teknoloji Danışmanlığı',
        description: 'Teknoloji entegrasyonu danışmanlığı',
        duration: 75,
        price: 450,
        currency: 'TRY'
      }
    ],
    
    // Personal Services
    'personal_training': [
      {
        name: 'Kişisel Antrenman',
        description: 'Birebir kişisel antrenman seansı',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Grup Antrenmanı',
        description: 'Grup fitness antrenmanı',
        duration: 45,
        price: 80,
        currency: 'TRY'
      },
      {
        name: 'Fitness Değerlendirmesi',
        description: 'Fitness seviyesi değerlendirme',
        duration: 30,
        price: 150,
        currency: 'TRY'
      },
      {
        name: 'Beslenme Danışmanlığı',
        description: 'Beslenme planı ve danışmanlık',
        duration: 60,
        price: 250,
        currency: 'TRY'
      }
    ],
    
    'tutoring': [
      {
        name: 'Matematik Dersi',
        description: 'Birebir matematik özel dersi',
        duration: 60,
        price: 150,
        currency: 'TRY'
      },
      {
        name: 'İngilizce Dersi',
        description: 'İngilizce konuşma ve gramer dersi',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Fen Bilimleri',
        description: 'Fizik, kimya, biyoloji dersi',
        duration: 90,
        price: 250,
        currency: 'TRY'
      },
      {
        name: 'Sınav Hazırlığı',
        description: 'Üniversite sınavı hazırlık dersi',
        duration: 120,
        price: 300,
        currency: 'TRY'
      }
    ],
    
    'photography': [
      {
        name: 'Portre Fotoğrafçılığı',
        description: 'Bireysel portre fotoğraf çekimi',
        duration: 120,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'Düğün Fotoğrafçılığı',
        description: 'Düğün ve nikah fotoğraf çekimi',
        duration: 480,
        price: 2000,
        currency: 'TRY'
      },
      {
        name: 'Ürün Fotoğrafçılığı',
        description: 'E-ticaret ürün fotoğraf çekimi',
        duration: 180,
        price: 800,
        currency: 'TRY'
      },
      {
        name: 'Etkinlik Fotoğrafçılığı',
        description: 'Kurumsal etkinlik fotoğraf çekimi',
        duration: 240,
        price: 1200,
        currency: 'TRY'
      }
    ],
    
    // Automotive - Multiple ID variations
    'auto_repair': [
      {
        name: 'Genel Bakım',
        description: 'Araç genel bakım ve kontrol',
        duration: 120,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Fren Sistemi',
        description: 'Fren balata ve disk değişimi',
        duration: 90,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'Motor Bakımı',
        description: 'Motor yağı ve filtre değişimi',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Elektrik Arızası',
        description: 'Araç elektrik sistemi arıza giderme',
        duration: 180,
        price: 400,
        currency: 'TRY'
      }
    ],
    
    // Alternative auto repair IDs
    'oto-tamir': [
      {
        name: 'Genel Bakım',
        description: 'Araç genel bakım ve kontrol',
        duration: 120,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Fren Sistemi',
        description: 'Fren balata ve disk değişimi',
        duration: 90,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'Motor Bakımı',
        description: 'Motor yağı ve filtre değişimi',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Elektrik Arızası',
        description: 'Araç elektrik sistemi arıza giderme',
        duration: 180,
        price: 400,
        currency: 'TRY'
      }
    ],
    
    'oto_tamir': [
      {
        name: 'Genel Bakım',
        description: 'Araç genel bakım ve kontrol',
        duration: 120,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Fren Sistemi',
        description: 'Fren balata ve disk değişimi',
        duration: 90,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'Motor Bakımı',
        description: 'Motor yağı ve filtre değişimi',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Elektrik Arızası',
        description: 'Araç elektrik sistemi arıza giderme',
        duration: 180,
        price: 400,
        currency: 'TRY'
      }
    ],
    
    'auto-repair': [
      {
        name: 'Genel Bakım',
        description: 'Araç genel bakım ve kontrol',
        duration: 120,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Fren Sistemi',
        description: 'Fren balata ve disk değişimi',
        duration: 90,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'Motor Bakımı',
        description: 'Motor yağı ve filtre değişimi',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Elektrik Arızası',
        description: 'Araç elektrik sistemi arıza giderme',
        duration: 180,
        price: 400,
        currency: 'TRY'
      }
    ],
    
    'car_repair': [
      {
        name: 'Genel Bakım',
        description: 'Araç genel bakım ve kontrol',
        duration: 120,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Fren Sistemi',
        description: 'Fren balata ve disk değişimi',
        duration: 90,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'Motor Bakımı',
        description: 'Motor yağı ve filtre değişimi',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Elektrik Arızası',
        description: 'Araç elektrik sistemi arıza giderme',
        duration: 180,
        price: 400,
        currency: 'TRY'
      }
    ],
    
    'automotive': [
      {
        name: 'Genel Bakım',
        description: 'Araç genel bakım ve kontrol',
        duration: 120,
        price: 300,
        currency: 'TRY'
      },
      {
        name: 'Fren Sistemi',
        description: 'Fren balata ve disk değişimi',
        duration: 90,
        price: 500,
        currency: 'TRY'
      },
      {
        name: 'Motor Bakımı',
        description: 'Motor yağı ve filtre değişimi',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Elektrik Arızası',
        description: 'Araç elektrik sistemi arıza giderme',
        duration: 180,
        price: 400,
        currency: 'TRY'
      }
    ],
    
    'car_wash': [
      {
        name: 'Standart Yıkama',
        description: 'Araç dış yıkama ve kurulama',
        duration: 30,
        price: 50,
        currency: 'TRY'
      },
      {
        name: 'Detaylı Temizlik',
        description: 'İç ve dış detaylı temizlik',
        duration: 120,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Cila ve Wax',
        description: 'Araç cilalama ve koruma',
        duration: 90,
        price: 150,
        currency: 'TRY'
      },
      {
        name: 'Motor Temizliği',
        description: 'Motor bölümü temizlik',
        duration: 60,
        price: 100,
        currency: 'TRY'
      }
    ],
    
    // General
    'other': [
      {
        name: 'Genel Danışmanlık',
        description: 'Genel iş danışmanlık hizmeti',
        duration: 60,
        price: 200,
        currency: 'TRY'
      },
      {
        name: 'Teknik Destek',
        description: 'Teknik destek ve çözüm hizmeti',
        duration: 45,
        price: 150,
        currency: 'TRY'
      },
      {
        name: 'Eğitim Hizmeti',
        description: 'Özel eğitim ve öğretim hizmeti',
        duration: 90,
        price: 250,
        currency: 'TRY'
      },
      {
        name: 'Konsültasyon',
        description: 'Uzman konsültasyon hizmeti',
        duration: 30,
        price: 120,
        currency: 'TRY'
      }
    ],
    
    // Default fallback for unknown business types
    'default': [
      {
        name: 'Temel Hizmet',
        description: 'Temel işletme hizmeti',
        duration: 60,
        price: 100,
        currency: 'TRY'
      },
      {
        name: 'Danışmanlık',
        description: 'Profesyonel danışmanlık hizmeti',
        duration: 45,
        price: 150,
        currency: 'TRY'
      },
      {
        name: 'Konsültasyon',
        description: 'Uzman konsültasyon hizmeti',
        duration: 30,
        price: 120,
        currency: 'TRY'
      },
      {
        name: 'Destek Hizmeti',
        description: 'Müşteri destek hizmeti',
        duration: 30,
        price: 80,
        currency: 'TRY'
      }
    ]
  };
  
  // Try exact match first
  if (suggestions[businessTypeId]) {
    return suggestions[businessTypeId];
  }
  
  // Try alternative ID formats
  const alternativeIds = [
    businessTypeId.toLowerCase(),
    businessTypeId.replace(/_/g, '-'),
    businessTypeId.replace(/-/g, '_'),
    businessTypeId.replace(/\s+/g, '_'),
    businessTypeId.replace(/\s+/g, '-')
  ];
  
  for (const altId of alternativeIds) {
    if (suggestions[altId]) {
      return suggestions[altId];
    }
  }
  
  // Check if it's an auto repair business by name/display name
  if (typeof businessType === 'object' && businessType.displayName) {
    const displayName = businessType.displayName.toLowerCase();
    if (displayName.includes('oto') || displayName.includes('tamir') || displayName.includes('auto') || displayName.includes('repair')) {
      return suggestions['auto_repair'];
    }
  }
  
  return suggestions['default'];
};

export const convertSuggestionToServiceData = (suggestion: ServiceSuggestion): CreateServiceData => {
  return {
    name: suggestion.name,
    description: suggestion.description,
    duration: suggestion.duration,
    price: suggestion.price,
    currency: suggestion.currency
  };
};
