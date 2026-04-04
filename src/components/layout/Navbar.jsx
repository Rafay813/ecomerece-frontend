import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiShoppingCart,
  FiUser,
  FiMessageSquare,
  FiPackage,
  FiChevronDown,
  FiShoppingBag,
  FiMenu,
  FiX,
} from 'react-icons/fi'

const categories = [
  'All category',
  'Automobiles',
  'Clothes and wear',
  'Home interiors',
  'Computer and tech',
  'Tools, equipments',
  'Sports and outdoor',
  'Animal and pets',
  'Machinery tools',
]

const navLinks = ['Hot offers', 'Gift boxes', 'Projects', 'Menu item']

const Navbar = () => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All category')
  const [showCatDropdown, setShowCatDropdown] = useState(false)
  const [showHelpDropdown, setShowHelpDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?q=${search}`)
  }

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">

      {/* ── Top Bar ── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <FiShoppingBag className="text-white text-lg" />
          </div>
          <span className="text-blue-600 font-bold text-xl tracking-tight hidden sm:block">Brand</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-1 min-w-0 border border-gray-300 rounded-md overflow-visible relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-0 px-4 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
          />

          {/* Category Dropdown */}
          <div className="relative hidden md:flex">
            <button
              type="button"
              onClick={() => setShowCatDropdown(!showCatDropdown)}
              className="flex items-center gap-1.5 border-l border-gray-300 px-3 text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap h-full"
            >
              {selectedCategory}
              <FiChevronDown size={14} className={`transition-transform ${showCatDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCatDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl w-52 z-50 py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setSelectedCategory(cat); setShowCatDropdown(false) }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors
                      ${selectedCategory === cat
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 text-sm font-medium transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Right Icons — desktop */}
        <div className="hidden md:flex items-center gap-5 shrink-0 ml-2">
          {[
            { icon: <FiUser size={22} />, label: 'Profile', to: '/' },
            { icon: <FiMessageSquare size={22} />, label: 'Message', to: '/' },
            { icon: <FiPackage size={22} />, label: 'Orders', to: '/' },
            { icon: <FiShoppingCart size={22} />, label: 'My cart', to: '/cart' },
          ].map(({ icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors gap-0.5 group"
            >
              <span className="group-hover:scale-110 transition-transform">{icon}</span>
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden ml-auto text-gray-600 hover:text-blue-600 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* ── Bottom Nav Bar ── */}
      <div className="border-t border-gray-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">

          {/* Left links */}
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600 transition-colors font-medium">
              <FiMenu size={16} />
              All category
            </button>

            <div className="w-px h-4 bg-gray-200" />

            {navLinks.map((link) => (
              <Link
                key={link}
                to="/products"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link}
              </Link>
            ))}

            {/* Help Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Help
                <FiChevronDown size={13} className={`transition-transform ${showHelpDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showHelpDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1 z-50">
                  {['Help Center', 'Contact Us', 'FAQ'].map((item) => (
                    <button key={item} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Language & Ship to */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
              English, USD
              <FiChevronDown size={13} />
            </button>
            <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Ship to
              <span className="text-base">🇩🇪</span>
              <FiChevronDown size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4 shadow-lg">

          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-1">
            {['All category', ...navLinks, 'Help'].map((link) => (
              <Link
                key={link}
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-gray-700 hover:text-blue-600 py-2 border-b border-gray-50 transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Mobile Icons */}
          <div className="grid grid-cols-4 gap-3 pt-2">
            {[
              { icon: <FiUser size={20} />, label: 'Profile', to: '/' },
              { icon: <FiMessageSquare size={20} />, label: 'Message', to: '/' },
              { icon: <FiPackage size={20} />, label: 'Orders', to: '/' },
              { icon: <FiShoppingCart size={20} />, label: 'Cart', to: '/cart' },
            ].map(({ icon, label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                {icon}
                <span className="text-xs">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
