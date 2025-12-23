import React, { useState, useEffect } from 'react';
import { ShoppingBag, Phone, X, Plus, Edit2, Trash2, Settings, Save, Instagram } from 'lucide-react';
import * as productAPI from './services/api';
import './App.css';

const ShirniyyatMagazasi = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [settings, setSettings] = useState({
    shopName: 'Aghayeva cake and dessert house',
    phone: '994553012028',
    description: 'Ən təzə və dadlı şirniyyatlar',
    instagram: 'https://www.instagram.com/cake_and_dessert_house?igsh=MWRzdjZvMGxqbm5rNQ==',
    adminPassword: 'admin123'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);

  // Load data from server
  useEffect(() => {
    loadData();

    // Settings localStorage-dən oxu və default ilə merge et
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Köhnə settings ilə yeni default-ları birləşdir
      setSettings(prevSettings => ({
        ...prevSettings,
        ...parsed
      }));
    }
  }, []);

  const loadData = async () => {
    try {
      // Serverdən məhsulları əldə et
      const response = await productAPI.getAllProducts();
      if (response.success) {
        // Backend strukturunu frontend strukturuna çevir
        const formattedProducts = response.products.map(product => ({
          id: product._id,
          name: product.ad,
          price: `${product.qiymet} AZN`,
          image: product.sekil ? `https://sirniyyat-back-1.onrender.com${product.sekil}` : '',
          description: product.tesvir || '',
          weight: product.ceki ? `${product.ceki} qram` : ''
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Məhsulları yükləmə xətası:', error);
      // Xəta olsa belə, boş array göstər
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };



  const saveSettings = (newSettings) => {
    try {
      // Settings hələ serverə yazılmır, localStorage istifadə edirik
      localStorage.setItem('settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      setShowSettings(false);
      alert('Tənzimləmələr saxlanıldı!');
    } catch (error) {
      console.error('Saxlama xətası:', error);
      alert('Saxlama zamanı xəta baş verdi!');
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setLoginPassword('');
  };

  const handleLogin = () => {
    if (loginPassword === settings.adminPassword) {
      setIsAdminLoggedIn(true);
      setShowLoginModal(false);
      setShowAdmin(true);
      setLoginPassword('');
    } else {
      alert('Yanlış şifrə!');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setShowAdmin(false);
  };

  const handleAddProduct = () => {
    setEditingProduct({
      id: null, // Yeni məhsul üçün ID yoxdur, server yaradacaq
      name: '',
      price: '',
      image: '',
      description: '',
      weight: '',
      imageFile: null
    });
  };

  const handleSaveProduct = async () => {
    if (!editingProduct.name || !editingProduct.price) {
      alert('Ad və qiymət daxil edin!');
      return;
    }

    try {
      setImageLoading(true);

      // Qiyməti ədədə çevir ("15 AZN" -> 15)
      const priceNumber = parseFloat(editingProduct.price.replace(/[^0-9.]/g, ''));

      // Çəkini ədədə çevir ("500 qram" -> 500)
      const weightNumber = editingProduct.weight ? parseFloat(editingProduct.weight.replace(/[^0-9.]/g, '')) : 0;

      const productData = {
        name: editingProduct.name,
        price: priceNumber,
        description: editingProduct.description || '',
        weight: weightNumber,
        imageFile: editingProduct.imageFile // Yeni şəkil faylı (əgər varsa)
      };

      // Yoxla: yeni məhsul yoxsa mövcud məhsulu redaktə edirik?
      const existingProduct = products.find(p => p.id === editingProduct.id);

      let response;
      if (existingProduct) {
        // Məhsul yenilə
        response = await productAPI.updateProduct(editingProduct.id, productData);
      } else {
        // Yeni məhsul yarat
        response = await productAPI.createProduct(productData);
      }

      if (response.success) {
        alert(response.message);
        // Məhsulları yenidən yüklə
        await loadData();
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Məhsul saxlama xətası:', error);
      alert('Məhsul saxlanarkən xəta baş verdi!');
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Silmək istədiyinizdən əminsiniz?')) {
      try {
        const response = await productAPI.deleteProduct(id);
        if (response.success) {
          alert(response.message);
          // Məhsulları yenidən yüklə
          await loadData();
        }
      } catch (error) {
        console.error('Məhsul silmə xətası:', error);
        alert('Məhsul silinərkən xəta baş verdi!');
      }
    }
  };

  const handleWhatsAppClick = (product) => {
    const message = `Salam! ${product.name} sifariş etmək istəyirəm. Qiymət: ${product.price}`;
    const cleanPhone = settings.phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <ShoppingBag className="text-orange-600 mx-auto mb-4 float" size={64} />
            <div className="absolute inset-0 bg-orange-300 blur-3xl opacity-30 animate-pulse"></div>
          </div>
          <div className="shimmer h-6 w-32 mx-auto rounded-lg"></div>
          <p className="text-gray-600 mt-4 font-medium">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Premium Header with Glassmorphism */}
      <header className="glass sticky top-0 z-40 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <ShoppingBag className="text-orange-600 transition-transform group-hover:scale-110" size={32} />
                <div className="absolute inset-0 bg-orange-400 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                {settings.shopName}
              </h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href={`tel:+${settings.phone}`}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <Phone size={18} />
                <span className="font-medium">+{settings.phone}</span>
              </a>
              <button
                onClick={handleLoginClick}
                className="p-3 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white/80 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ripple"
                title="Admin Girişi"
              >
                <Settings size={20} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Premium Hero Section */}
        <div className="text-center mb-12 sm:mb-16 fade-in">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-lg">
              🍰 Ən Yaxşı Şirniyyatlar
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Xoş Gəlmisiniz
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {settings.description}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online sifariş qəbul olunur
          </div>
        </div>


        {/* Premium Admin Panel */}
        {showAdmin && isAdminLoggedIn && (
          <div className="mb-12 fade-in">
            {/* Admin Header */}
            <div className="glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    Admin Panel
                  </h3>
                  <p className="text-gray-600 text-sm">Məhsulları idarə edin</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ripple"
                  >
                    <Settings size={18} />
                    <span className="hidden sm:inline">Tənzimləmələr</span>
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ripple"
                  >
                    <Plus size={18} />
                    <span>Məhsul Əlavə Et</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ripple"
                  >
                    <X size={18} />
                    <span className="hidden sm:inline">Çıxış</span>
                  </button>
                </div>
              </div>

              {/* Products List */}
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-4">
                    <ShoppingBag className="mx-auto text-gray-300 float" size={64} />
                    <div className="absolute inset-0 bg-gray-200 blur-2xl opacity-20"></div>
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">Hələ məhsul yoxdur</p>
                  <p className="text-gray-400 text-sm">
                    "Məhsul Əlavə Et" düyməsinə klikləyin
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 stagger-item"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-md"
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="text-orange-300" size={32} />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-lg mb-1 truncate">
                          {product.name}
                        </h4>
                        <p className="text-orange-600 font-semibold text-base">
                          {product.price}
                        </p>
                        {product.weight && (
                          <p className="text-gray-500 text-sm mt-1">{product.weight}</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2.5 sm:p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                          title="Redaktə et"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2.5 sm:p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Premium Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 fade-in">
            <div className="relative inline-block mb-6">
              <ShoppingBag className="mx-auto text-gray-300 float" size={80} />
              <div className="absolute inset-0 bg-gray-200 blur-3xl opacity-20"></div>
            </div>
            <p className="text-gray-500 text-xl font-medium mb-2">Məhsul yoxdur</p>
            {!isAdminLoggedIn && (
              <p className="text-gray-400 text-sm">Admin panelinə daxil olaraq məhsul əlavə edin</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="stagger-item premium-card bg-white rounded-3xl shadow-xl overflow-hidden hover-lift cursor-pointer group"
                onClick={() => setSelectedProduct(product)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Product Image with Overlay */}
                <div className="relative overflow-hidden h-56 sm:h-64 bg-gradient-to-br from-orange-100 to-pink-100">
                  {product.image ? (
                    <>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={80} className="text-orange-300 group-hover:scale-110 transition-transform" />
                    </div>
                  )}

                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-new shadow-lg">YENİ</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold price-tag">
                      {product.price}
                    </span>
                    {product.weight && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {product.weight}
                      </span>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ripple"
                  >
                    Ətraflı Bax
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Premium Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Image Section */}
            <div className="relative h-72 sm:h-96 overflow-hidden">
              {selectedProduct.image ? (
                <>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 flex items-center justify-center">
                  <ShoppingBag size={120} className="text-white/80" />
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl group"
              >
                <X size={24} className="text-gray-700 group-hover:rotate-90 transition-transform" />
              </button>

              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6">
                <span className="badge badge-new text-base px-6 py-2">Premium Məhsul</span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-8 lg:p-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                {selectedProduct.name}
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl sm:text-4xl font-bold price-tag">
                  {selectedProduct.price}
                </span>
                {selectedProduct.weight && (
                  <span className="bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                    📦 {selectedProduct.weight}
                  </span>
                )}
              </div>

              {selectedProduct.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Təsvir</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* WhatsApp Order Button */}
              <button
                onClick={() => handleWhatsAppClick(selectedProduct)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 text-lg font-bold ripple group"
              >
                <Phone size={24} className="group-hover:rotate-12 transition-transform" />
                WhatsApp ilə Sifariş Et
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                🚚 Sürətli çatdırılma | ✅ Keyfiyyət zəmanəti
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Məhsul Redaktə</h2>
              <button onClick={() => setEditingProduct(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ad</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Qiymət</label>
                <input
                  type="text"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="15 AZN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Şəkil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Şəkil çox böyükdür! Maksimum 5MB');
                        return;
                      }
                      setImageLoading(true);

                      // Preview üçün base64-ə çevir
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditingProduct({
                          ...editingProduct,
                          image: reader.result, // Preview üçün
                          imageFile: file // Server üçün fayl obyekti
                        });
                        setImageLoading(false);
                      };
                      reader.onerror = () => {
                        alert('Şəkil yüklənmədi, yenidən cəhd edin');
                        setImageLoading(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={imageLoading}
                />
                {imageLoading && (
                  <div className="mt-2 text-sm text-blue-600">
                    Şəkil yüklənir...
                  </div>
                )}
                {editingProduct.image && !imageLoading && (
                  <div className="mt-2">
                    <img src={editingProduct.image} alt="Preview" className="w-32 h-32 object-cover rounded shadow-md" />
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                      className="mt-1 text-xs text-red-600 hover:text-red-700"
                    >
                      Şəkili sil
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">📱 Telefon və ya 💻 kompüterdən şəkil seçin (maksimum 5MB)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Təsvir</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Çəki</label>
                <input
                  type="text"
                  value={editingProduct.weight}
                  onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="500 qram"
                />
              </div>
              <button
                onClick={handleSaveProduct}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Saxla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && isAdminLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Tənzimləmələr</h2>
              <button onClick={() => setShowSettings(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mağaza Adı</label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefon (WhatsApp)</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="994553012028"
                />
                <p className="text-xs text-gray-500 mt-1">Format: 994553012028 (ölkə kodu ilə, boşluqsuz)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Təsvir</label>
                <input
                  type="text"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Şifrəsi</label>
                <input
                  type="password"
                  value={settings.adminPassword}
                  onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instagram Link</label>
                <input
                  type="text"
                  value={settings.instagram || ''}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="https://www.instagram.com/username"
                />
                <p className="text-xs text-gray-500 mt-1">İnstagram profilinizin linki</p>
              </div>
              <button
                onClick={() => saveSettings(settings)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Saxla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Admin Girişi</h2>
              <button onClick={() => setShowLoginModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Şifrə</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Şifrənizi daxil edin"
                  autoFocus
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Daxil Ol
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Premium Footer */}
      <footer className="relative mt-20 overflow-hidden">
        {/* Decorative Top Wave */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
          <svg className="absolute bottom-0 w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
              className="fill-gray-900"></path>
          </svg>
        </div>

        <div className="relative bg-gray-900 text-white pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand Section */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <ShoppingBag className="text-orange-500" size={32} />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                    {settings.shopName}
                  </h3>
                </div>
                <p className="text-gray-400 mb-4">{settings.description}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-green-400">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online sifariş qəbul olunur
                </div>
              </div>

              {/* Contact Info */}
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-4 text-orange-400">Əlaqə</h4>
                <div className="space-y-3">
                  <a
                    href={`tel:+${settings.phone}`}
                    className="flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <Phone size={18} />
                    <span>+{settings.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Phone size={18} />
                    WhatsApp
                  </a>
                  {settings.instagram && (
                    <a
                      href={settings.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <Instagram size={18} />
                      Instagram
                    </a>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="text-center md:text-right">
                <h4 className="text-lg font-semibold mb-4 text-orange-400">Xidmətlər</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>🚚 Sürətli Çatdırılma</li>
                  <li>✅ Keyfiyyət Zəmanəti</li>
                  <li>🎂 Xüsusi Sifarişlər</li>
                  <li>💳 Online Ödəniş</li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-6 mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                <p>© {new Date().getFullYear()} {settings.shopName} - Bütün hüquqlar qorunur</p>
                <p className="flex items-center gap-2">
                  Made with <span className="text-red-500 animate-pulse">❤️</span> in Azerbaijan
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShirniyyatMagazasi;