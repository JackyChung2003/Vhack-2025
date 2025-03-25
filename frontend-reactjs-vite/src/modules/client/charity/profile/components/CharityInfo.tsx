import React, { useState, useEffect } from "react";
import { FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaSave, FaImage } from "react-icons/fa";
import { CharityProfile, charityService } from "../../../../../services/supabase/charityService";

interface CharityInfoProps {
  charity: CharityProfile;
  isEditing: boolean;
  onSave: (formData: Partial<CharityProfile>) => Promise<void>;
}

const CharityInfo: React.FC<CharityInfoProps> = ({ charity, isEditing, onSave }) => {
  const [formData, setFormData] = useState<Partial<CharityProfile>>(charity);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  
  useEffect(() => {
    setFormData(charity);
  }, [charity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let updatedData = { ...formData };
      
      // If a new logo was selected, upload it first
      if (logoFile) {
        const logoUrl = await charityService.uploadLogo(logoFile);
        updatedData.logo = logoUrl;
      }
      
      // Save the updated charity data
      await onSave(updatedData);
    } catch (error) {
      console.error("Error saving charity info:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--main)] rounded-xl border border-[var(--stroke)] overflow-hidden">
      <div className="p-6 border-b border-[var(--stroke)]">
        <h2 className="text-xl font-bold text-[var(--headline)]">Organization Information</h2>
        <p className="text-[var(--paragraph)] text-sm mt-1">
          {isEditing ? "Edit your organization details below" : "View your organization details"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">Organization Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
                required
              />
            ) : (
              <p className="text-[var(--paragraph)] p-3 bg-[var(--background)] rounded-lg">{charity.name}</p>
            )}
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">Description</label>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
                required
              />
            ) : (
              <p className="text-[var(--paragraph)] p-3 bg-[var(--background)] rounded-lg">{charity.description}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Founded
            </label>
            {isEditing ? (
              <input
                type="text"
                name="founded"
                value={formData.founded}
                onChange={handleChange}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
              />
            ) : (
              <p className="text-[var(--paragraph)] p-3 bg-[var(--background)] rounded-lg">{charity.founded}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
              />
            ) : (
              <p className="text-[var(--paragraph)] p-3 bg-[var(--background)] rounded-lg">{charity.location}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">
              <FaGlobe className="inline mr-2" />
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
              />
            ) : (
              <p className="text-[var(--paragraph)] p-3 bg-[var(--background)] rounded-lg">{charity.website}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">
              <FaEnvelope className="inline mr-2" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
              />
            ) : (
              <p className="text-[var(--paragraph)] p-3 bg-[var(--background)] rounded-lg">{charity.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">
              <FaPhone className="inline mr-2" />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
              />
            ) : (
              <p className="text-[var(--paragraph)] p-3 bg-[var(--background)] rounded-lg">{charity.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--headline)] mb-2">
              <FaImage className="inline mr-2" />
              Logo
            </label>
            {isEditing ? (
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full p-3 border border-[var(--stroke)] rounded-lg bg-[var(--background)]"
                />
                {previewLogo && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden">
                    <img src={previewLogo} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-[var(--background)]">
                {charity.logo ? (
                  <img src={charity.logo} alt="Charity logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    No logo
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--highlight)] text-white rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors"
            >
              <FaSave /> Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CharityInfo; 