export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Özellikler', href: '#features' },
      { name: 'Fiyatlandırma', href: '#pricing' },
      { name: 'API', href: '#api' },
      { name: 'Entegrasyonlar', href: '#integrations' }
    ],
    company: [
      { name: 'Hakkımızda', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Kariyer', href: '#careers' },
      { name: 'Basın Kit', href: '#press' }
    ],
    support: [
      { name: 'Yardım Merkezi', href: '#help' },
      { name: 'Bize Ulaşın', href: '#contact' },
      { name: 'Durum', href: '#status' },
      { name: 'Sistem Gereksinimleri', href: '#requirements' }
    ],
    legal: [
      { name: 'Gizlilik Politikası', href: '#privacy' },
      { name: 'Kullanım Şartları', href: '#terms' },
      { name: 'Çerez Politikası', href: '#cookies' },
      { name: 'KVKK', href: '#gdpr' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-2xl font-bold">RandevuBu</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Berberler, kuaförler ve salon sahipleri için özel olarak tasarlanmış modern randevu rezervasyon platformu. İşinizi kolaylaştırın ve müşterilerinizi memnun edin.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.0173 0C5.39459 0 0 5.39459 0 12.0173C0 18.64 5.39459 24.0346 12.0173 24.0346C18.64 24.0346 24.0346 18.64 24.0346 12.0173C24.0346 5.39459 18.64 0 12.0173 0ZM17.7624 17.7624C17.2425 18.2823 16.6274 18.692 15.9519 18.9742C15.2764 19.2564 14.5528 19.4054 13.8219 19.4136H10.2127C9.48181 19.4054 8.75822 19.2564 8.08272 18.9742C7.40722 18.692 6.79214 18.2823 6.27223 17.7624C5.75232 17.2425 5.34263 16.6274 5.06041 15.9519C4.77819 15.2764 4.62918 14.5528 4.62099 13.8219V10.2127C4.62918 9.48181 4.77819 8.75822 5.06041 8.08272C5.34263 7.40722 5.75232 6.79214 6.27223 6.27223C6.79214 5.75232 7.40722 5.34263 8.08272 5.06041C8.75822 4.77819 9.48181 4.62918 10.2127 4.62099H13.8219C14.5528 4.62918 15.2764 4.77819 15.9519 5.06041C16.6274 5.34263 17.2425 5.75232 17.7624 6.27223C18.2823 6.79214 18.692 7.40722 18.9742 8.08272C19.2564 8.75822 19.4054 9.48181 19.4136 10.2127V13.8219C19.4054 14.5528 19.2564 15.2764 18.9742 15.9519C18.692 16.6274 18.2823 17.2425 17.7624 17.7624Z"/>
                  <path d="M12.0176 7.71533C9.56928 7.71533 7.58496 9.69965 7.58496 12.148C7.58496 14.5963 9.56928 16.5806 12.0176 16.5806C14.4659 16.5806 16.4502 14.5963 16.4502 12.148C16.4502 9.69965 14.4659 7.71533 12.0176 7.71533ZM12.0176 14.4831C10.7292 14.4831 9.68242 13.4363 9.68242 12.148C9.68242 10.8596 10.7292 9.81279 12.0176 9.81279C13.3059 9.81279 14.3527 10.8596 14.3527 12.148C14.3527 13.4363 13.3059 14.4831 12.0176 14.4831Z"/>
                  <path d="M16.6775 6.26514C16.6775 6.81385 16.2362 7.25514 15.6875 7.25514C15.1388 7.25514 14.6975 6.81385 14.6975 6.26514C14.6975 5.71643 15.1388 5.27514 15.6875 5.27514C16.2362 5.27514 16.6775 5.71643 16.6775 6.26514Z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Ürün</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Şirket</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Destek</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Yasal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 RandevuBu. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">🇹🇷 Türkçe</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Korunuyor</span>
                <div className="flex items-center space-x-1 bg-gray-800 px-3 py-1 rounded">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-400">SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}