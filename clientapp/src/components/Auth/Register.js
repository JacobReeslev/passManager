import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { register } from '../../services/authService';
import { deriveKey } from '../../services/encryptionService';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form inputs
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (masterPassword !== confirmMasterPassword) {
      setError('Master passwords do not match.');
      setLoading(false);
      return;
    }

    if (masterPassword.length < 8) {
      setError('Master password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      // Register with the server
      await register(username, email, password);
      
      // Derive encryption key from master password (never sent to server)
      const key = await deriveKey(masterPassword);
      
      // Export the key as JWK and store it in localStorage
      const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
      localStorage.setItem('masterKey', JSON.stringify(exportedKey));
      
      // Redirect to passwords page
      navigate('/passwords');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.data) {
        setError(`Registration failed: ${error.response.data}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-center mb-4">Register</h2>
      
      {error && <Alert color="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="username">Username</Label>
          <Input
            type="text"
            name="username"
            id="username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label for="password">Password</Label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label for="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label for="masterPassword">Master Password for Encryption</Label>
          <Input
            type="password"
            name="masterPassword"
            id="masterPassword"
            placeholder="Choose a master password for encryption/decryption"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            required
          />
          <small className="form-text text-muted">
            This password will be used to encrypt/decrypt your passwords. 
            It is never sent to the server. Make sure it's strong and you remember it!
          </small>
        </FormGroup>
        
        <FormGroup>
          <Label for="confirmMasterPassword">Confirm Master Password</Label>
          <Input
            type="password"
            name="confirmMasterPassword"
            id="confirmMasterPassword"
            placeholder="Confirm your master password"
            value={confirmMasterPassword}
            onChange={(e) => setConfirmMasterPassword(e.target.value)}
            required
          />
        </FormGroup>
        
        <Button 
          color="primary" 
          block 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </Form>
    </div>
  );
};

export default Register;