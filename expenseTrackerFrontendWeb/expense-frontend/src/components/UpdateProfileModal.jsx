import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UpdateProfileModal({ isOpen, onClose, currentName, currentBio, currentImage }) {
  const [name, setName] = useState(currentName || '');
  const [bio, setBio] = useState(currentBio || '');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentName || '');
      setBio(currentBio || '');
      setFile(null);
    }
  }, [isOpen, currentName, currentBio]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    const userDto = {
        name: name,
        bio: bio,
        // email is typically not updated here or requires more valid, but we can send existing if needed or just omitted if backend handles nulls
    };
    
    // Backend expects 'user' as a JSON string
    formData.append('user', JSON.stringify(userDto));
    if (file) {
        formData.append('image', file);
    }

    try {
        await axios.put('http://localhost:8080/user/update', formData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // Update local storage if name changed, so navbar reflects it immediately without reload if we want
        // But usually we should refetch. For now let's just alert and reload or let parent handle.
 
        // We can't easily know the new image URL unless backend returns it, 
        // currently backend returns void/200 OK. 
        // So we might need to reload the page to see the new image or refetch user.
        
        alert("Profile updated successfully!");
        window.location.reload(); // Simple way to refresh state
        onClose();
    } catch (error) {
        console.error("Update failed", error);
        alert("Failed to update profile.");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000
    }}>
        <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '400px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Update Profile</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        readOnly
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f0f0f0', color: '#666', cursor: 'not-allowed' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Bio</label>
                    <textarea 
                        value={bio} 
                        onChange={e => setBio(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', minHeight: '60px' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Profile Image</label>
                    <input 
                        type="file" 
                        onChange={e => setFile(e.target.files[0])}
                        accept="image/*"
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={onClose} style={{
                        padding: '0.5rem 1rem', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer'
                    }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{
                        padding: '0.5rem 1rem', background: 'var(--color-primary-blue, #007bff)', color: 'white', 
                        border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}

export default UpdateProfileModal;
