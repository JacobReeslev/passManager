import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { createPassword } from '../../services/passwordService';
import { encryptPassword } from '../../services/encryptionService';

const AddPassword = () => {
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [masterKey, setMasterKey] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Import the master key from localStorage
    const importMasterKey = async () => {
      try {
        const storedKey = localStorage.getItem('masterKey');
        if (!storedKey) {
          setError('Master encryption key not found. Please log in again.');
          return;
        }

        const keyData = JSON.parse(storedKey);
        const key = await window.crypto.subtle.importKey(
          'jwk',
          keyData,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        
        setMasterKey(key);
      } catch (error) {
        console.error('Failed to import master key:', error);
        setError('Failed to load encryption key. Please log in again.');
      }
    };

    importMasterKey();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!masterKey) {
      setError('Encryption key not available. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Encrypt the password client-side
      const { encryptedPassword, iv } = await encryptPassword(password, masterKey);
      
      // Create a new password entry with the encrypted data
      await createPassword({
        website,
        username,
        encryptedPassword,
        iv
      });
      
      // Redirect to the passwords list
      navigate('/passwords');
    } catch (error) {
      console.error('Failed to add password:', error);
      setError('Failed to add password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-center mb-4">Add New Password</h2>
      
      {error && <Alert color="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="website">Website/Application</Label>
          <Input
            type="text"
            name="website"
            id="website"
            placeholder="Enter website or application name"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label for="username">Username/Email</Label>
          <Input
            type="text"
            name="username"
            id="username"
            placeholder="Enter username or email for this account"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label for="password">Password</Label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Enter password to store"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <small className="form-text text-muted">
            This password will be encrypted before being sent to the server.
          </small>
        </FormGroup>
        
        <Button 
          color="primary" 
          block 
          type="submit"
          disabled={loading || !masterKey}
        >
          {loading ? 'Adding...' : 'Add Password'}
        </Button>
      </Form>
    </div>
  );
};

export default AddPassword;