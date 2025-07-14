import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AddPropertyPage from './pages/AddPropertyPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChatTest from './components/ChatTest';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          <Header />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/add-property" element={<AddPropertyPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/chat-test" element={<ChatTest />} />
          </Routes>

          <BottomNavigation />

          {/* Footer with Babui-inspired design */}
          <footer className="bg-gradient-to-r from-amber-900 via-orange-900 to-yellow-900 text-amber-50 py-12 mt-16 relative overflow-hidden">
            {/* Woven pattern background */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="weave" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M0,10 Q5,5 10,10 T20,10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                    <path d="M10,0 Q15,5 20,0" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                    <path d="M0,20 Q5,15 10,20" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#weave)"/>
              </svg>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3 6l3 8 3-8c1.5-1.5 3-3.5 3-6 0-3.5-2.5-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-100">বাবুই</h3>
                      <p className="text-sm text-amber-200">Babui</p>
                    </div>
                  </div>
                  <p className="text-amber-200 text-sm leading-relaxed">
                    Building homes with the precision and care of the master weaver bird
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-amber-100">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-amber-200">
                    <li><a href="#" className="hover:text-amber-100 transition-colors">Browse</a></li>
                    <li><a href="#" className="hover:text-amber-100 transition-colors">List Property</a></li>
                    <li><a href="#" className="hover:text-amber-100 transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-amber-100 transition-colors">Contact</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-amber-100">Cities</h4>
                  <ul className="space-y-2 text-sm text-amber-200">
                    <li><a href="#" className="hover:text-amber-100 transition-colors">Dhaka</a></li>
                    <li><a href="#" className="hover:text-amber-100 transition-colors">Chittagong</a></li>
                    <li><a href="#" className="hover:text-amber-100 transition-colors">Sylhet</a></li>
                    <li><a href="#" className="hover:text-amber-100 transition-colors">Rajshahi</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-amber-100">Support</h4>
                  <ul className="space-y-2 text-sm text-amber-200">
                    <li>Phone: +880 1700-000000</li>
                    <li>Email: support@babui.com</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-amber-800 pt-8 mt-8 text-center text-sm text-amber-200">
                <p>&copy; 2024 Babui. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;