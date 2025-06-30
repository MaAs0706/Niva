import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Phone, Mail, Edit, Save, X, Heart, User } from 'lucide-react';

interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

const ContactsManager: React.FC = () => {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
  });

  useEffect(() => {
    const savedContacts = localStorage.getItem('trustedContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trustedContacts', JSON.stringify(contacts));
  }, [contacts]);

  const relationshipSuggestions = [
    'Family Member',
    'Best Friend',
    'Partner',
    'Spouse',
    'Parent',
    'Sibling',
    'Close Friend',
    'Roommate',
    'Colleague',
    'Neighbor',
    'Emergency Contact'
  ];

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone || !newContact.relationship) return;

    const contact: TrustedContact = {
      id: Date.now().toString(),
      ...newContact,
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: '', phone: '', email: '', relationship: '' });
    setIsAdding(false);
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('Are you sure you want to remove this person from your trusted circle?')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const handleEditContact = (id: string, updatedContact: Partial<TrustedContact>) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, ...updatedContact } : c
    ));
    setEditingId(null);
  };

  const ContactCard: React.FC<{ contact: TrustedContact }> = ({ contact }) => {
    const [editData, setEditData] = useState(contact);
    const isEditing = editingId === contact.id;

    return (
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium transition-colors duration-300"
              placeholder="Name"
            />
            <input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
              placeholder="Phone"
            />
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
              placeholder="Email (optional)"
            />
            <input
              type="text"
              value={editData.relationship}
              onChange={(e) => setEditData({ ...editData, relationship: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
              placeholder="Relationship"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleEditContact(contact.id, editData)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">{contact.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded-lg transition-colors duration-300">
                      <User className="w-3 h-3 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                    </div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold transition-colors duration-300">{contact.relationship}</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingId(contact.id)}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
                <div className="p-1 bg-blue-50 dark:bg-blue-900/50 rounded-lg transition-colors duration-300">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                </div>
                <span className="font-medium">{contact.phone}</span>
              </div>
              {contact.email && (
                <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
                  <div className="p-1 bg-purple-50 dark:bg-purple-900/50 rounded-lg transition-colors duration-300">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                  </div>
                  <span className="font-medium">{contact.email}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 pb-24">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 transition-colors duration-300">Your Trusted Circle</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">These special people will be gently notified if you need support</p>
      </div>

      {/* Add Contact Form */}
      {isAdding && (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm p-6 mb-8 border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 transition-colors duration-300">Add Someone Special</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium transition-colors duration-300"
              placeholder="Name *"
            />
            <input
              type="tel"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
              placeholder="Phone *"
            />
            <input
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
              placeholder="Email (optional)"
            />
            
            {/* Relationship Field with Suggestions */}
            <div>
              <input
                type="text"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
                placeholder="Relationship (e.g., Best Friend, Family) *"
              />
              
              {/* Relationship Suggestions */}
              <div className="mt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 transition-colors duration-300">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {relationshipSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setNewContact({ ...newContact, relationship: suggestion })}
                      className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                        newContact.relationship === suggestion
                          ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                          : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-200 dark:hover:border-purple-700'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleAddContact}
                disabled={!newContact.name || !newContact.phone || !newContact.relationship}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Add to Circle
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewContact({ name: '', phone: '', email: '', relationship: '' });
                }}
                className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-6 font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-3 mb-8"
        >
          <Plus className="w-5 h-5" />
          <span>Add Someone to Your Circle</span>
        </button>
      )}

      {/* Contact List */}
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
              <Heart className="w-8 h-8 text-purple-400 dark:text-purple-500 transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 transition-colors duration-300">Your circle awaits</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">Add the people who care about you most. They'll be here when you need them.</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))
        )}
      </div>

      {contacts.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 transition-colors duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-xl transition-colors duration-300">
              <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-300 transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium transition-colors duration-300">
                <strong>{contacts.length}</strong> wonderful {contacts.length !== 1 ? 'people' : 'person'} in your circle. 
                They'll receive gentle notifications if you need support during a check-in.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsManager;