import React, { useEffect, useState } from 'react';
import { Droplets, MapPin, Phone, Mail, AlertCircle, Newspaper, Calendar, Users } from 'lucide-react';
import { Announcement, Site, Household } from '../../types';
import { getAllSites } from '../../services/siteService';
import { getAllHouseholds } from '../../services/householdService';

interface LandingPageProps {
  announcements: Announcement[];
  onLogin: () => void;
}

export default function LandingPage({ announcements, onLogin }: LandingPageProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const sitesData = await getAllSites();
      setSites(sitesData);
      const householdsData = await getAllHouseholds();
      setHouseholds(householdsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const publishedAnnouncements = announcements.filter(a => a.isPublished);
  const criticalSites = sites.filter(site => (site.currentLevel / site.reservoirCapacity) < 0.3);

  // Calculs pour la zone d'impact
  const totalSites = sites.length;
  const totalHouseholds = households.length;
  const averageLevel = sites.length > 0 ? Math.round(sites.reduce((sum, site) => sum + (site.currentLevel / site.reservoirCapacity), 0) / sites.length * 100) : 0;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Droplets className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AquaFlow
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Your trusted partner for drinking water distribution.
              Real-time monitoring, transparent communication, quality service.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={onLogin}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Professional Access
              </button>
              <a
                href="#contact"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Alerts */}
      {criticalSites.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Ongoing Alerts</h3>
                <p className="text-sm text-red-700">
                  {criticalSites.length} site(s) with critical water level: {criticalSites.map(s => s.name).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Impact</h2>
            <p className="mt-4 text-lg text-gray-600">Numbers that reflect our commitment</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{loading ? '-' : totalSites}</div>
              <div className="text-sm text-gray-600">Distribution Sites</div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{loading ? '-' : totalHouseholds}</div>
              <div className="text-sm text-gray-600">Served Households</div>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{loading ? '-' : `${averageLevel}%`}</div>
              <div className="text-sm text-gray-600">Average Reservoir Level</div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Continuous Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">News & Announcements</h2>
            <p className="mt-4 text-lg text-gray-600">Stay informed about our latest news</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedAnnouncements.slice(0, 6).map(announcement => (
              <div key={announcement.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-full mr-3 ${
                      announcement.type === 'news' ? 'bg-blue-100 text-blue-600' :
                      announcement.type === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {announcement.type === 'news' ? <Newspaper className="h-4 w-4" /> :
                       announcement.type === 'maintenance' ? <Calendar className="h-4 w-4" /> :
                       <AlertCircle className="h-4 w-4" />}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      announcement.type === 'news' ? 'bg-blue-100 text-blue-800' :
                      announcement.type === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {announcement.type === 'news' ? 'News' :
                       announcement.type === 'maintenance' ? 'Maintenance' : 'Emergency'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {announcement.content}
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    {announcement.publishedAt?.toLocaleDateString('en-US')}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {publishedAnnouncements.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No announcements available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="mt-4 text-lg text-gray-600">A modern approach to water distribution</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Monitoring</h3>
              <p className="text-gray-600">
                Our IoT sensors continuously monitor the water levels of all our reservoirs
                to ensure a constant supply.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">SMS Notifications</h3>
              <p className="text-gray-600">
                Receive automatic SMS alerts during tank refills
                or in case of scheduled maintenance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sector Management</h3>
              <p className="text-gray-600">
                Each sector has a dedicated manager to ensure local management
                and a quick response to needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
            <p className="mt-4 text-lg text-gray-600">We are here to answer your questions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">+243996578437</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">aquaflow@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">95200 Rue Lys Route, Congo The Democratic Republic of the, CD</span>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>8h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>9h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>24/7 Emergencies:</strong> +243996578437
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.cd"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+243 970706513"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your message..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Clients Say</h2>
            <p className="mt-4 text-lg text-gray-600">Real feedback from our community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm flex flex-col items-center">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Client" className="w-16 h-16 rounded-full mb-4" />
              <p className="text-gray-700 italic mb-2">“AquaFlow a transformé la gestion de l’eau dans notre quartier. Service rapide et fiable !”</p>
              <span className="text-sm font-semibold text-blue-700">Jean K., Kinshasa</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm flex flex-col items-center">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Client" className="w-16 h-16 rounded-full mb-4" />
              <p className="text-gray-700 italic mb-2">“Les alertes SMS sont très pratiques, on est toujours informé en cas de coupure ou de maintenance.”</p>
              <span className="text-sm font-semibold text-blue-700">Fatou M., Goma</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm flex flex-col items-center">
              <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Client" className="w-16 h-16 rounded-full mb-4" />
              <p className="text-gray-700 italic mb-2">“L’équipe est à l’écoute et très professionnelle. Je recommande AquaFlow à tous !”</p>
              <span className="text-sm font-semibold text-blue-700">Patrick N., Bukavu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Partners</h2>
            <p className="mt-4 text-lg text-gray-600">We work with trusted organizations</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Unicef_logo.png" alt="UNICEF" className="h-12" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/World_Bank_logo.png" alt="World Bank" className="h-10" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2e/Logo_AFD.png" alt="AFD" className="h-10" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Logo_Red_Cross.svg" alt="Red Cross" className="h-10" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Logo_GIZ.svg" alt="GIZ" className="h-10" />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-600">Find answers to common questions</p>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-blue-700 mb-2">Comment puis-je m’abonner à AquaFlow ?</h4>
              <p className="text-gray-700">Contactez-nous via le formulaire ou par téléphone. Notre équipe vous guidera dans les démarches d’abonnement.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-blue-700 mb-2">Comment recevoir les alertes SMS ?</h4>
              <p className="text-gray-700">Dès que votre ménage est enregistré, vous recevrez automatiquement les notifications importantes sur votre téléphone.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-blue-700 mb-2">Que faire en cas de coupure d’eau ?</h4>
              <p className="text-gray-700">Consultez la section “Ongoing Alerts” ou contactez notre support pour plus d’informations et d’assistance.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-blue-700 mb-2">Puis-je suivre la consommation de mon secteur ?</h4>
              <p className="text-gray-700">Oui, les gestionnaires de secteur ont accès à des tableaux de bord détaillés pour suivre les niveaux d’eau et la consommation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Call to Action */}
      <div className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to join AquaFlow ?</h2>
          <p className="text-lg text-blue-100 mb-8">Contact our team or create your professional account to benefit from a modern, reliable and transparent water distribution service.</p>
          <button
            onClick={onLogin}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Professional Access
          </button>
        </div>
      </div>

      {/* Footer enrichi */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Droplets className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">AquaFlow</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for modern, transparent and efficient water distribution.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 AquaFlow. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Water distribution</li>
                <li>Real-time monitoring</li>
                <li>Preventive maintenance</li>
                <li>Technical support</li>
                <li>Client testimonials</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+243996578437</li>
                <li>aquaflow@gmail.com</li>
                <li>95200 Rue Lys Route </li>
                <li>Congo The Democratic Republic of the, CD</li>
              </ul>
              <div className="mt-6">
                <a href="#" className="text-blue-400 hover:underline text-sm">Privacy Policy</a>
                <span className="mx-2 text-gray-500">|</span>
                <a href="#" className="text-blue-400 hover:underline text-sm">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}