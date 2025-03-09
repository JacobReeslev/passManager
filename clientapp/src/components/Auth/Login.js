import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { login } from '../../services/authService';
import { deriveKey } from '../../services/encryptionService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Authenticate with the server
      await login(email, password);
      
      // Derive encryption key from master password (never sent to server)
      const key = await deriveKey(masterPassword);
      
      // Export the key as JWK and store it in localStorage
      const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
      localStorage.setItem('masterKey', JSON.stringify(exportedKey));
      
      // Redirect to passwords page
      navigate('/passwords');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-center mb-4">Login</h2>
      
      {error && <Alert color="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label for="masterPassword">Master Password for Encryption</Label>
          <Input
            type="password"
            name="masterPassword"
            id="masterPassword"
            placeholder="Enter your master password for encryption/decryption"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            required
          />
          <small className="form-text text-muted">
            This password will be used to encrypt/decrypt your passwords. 
            It is never sent to the server.
          </small>
        </FormGroup>
        
        <Button 
          color="primary" 
          block 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
    </div>
  );
};

export default Login;