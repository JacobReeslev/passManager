import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Alert, Card, CardBody, CardTitle, CardSubtitle, Row, Col, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { getPasswords, deletePassword } from '../../services/passwordService';
import { decryptPassword } from '../../services/encryptionService';

const PasswordsList = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [masterKey, setMasterKey] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  useEffect(() => {
    // Import the master key from localStorage
    const importMasterKey = async () => {
      try {
        const storedKey = localStorage.getItem('masterKey');
        if (!storedKey) {
          setError('Master encryption key not found. Please log in again.');
          setLoading(false);
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
        fetchPasswords();
      } catch (error) {
        console.error('Failed to import master key:', error);
        setError('Failed to load encryption key. Please log in again.');
        setLoading(false);
      }
    };

    importMasterKey();
  }, []);

  const fetchPasswords = async () => {
    try {
      const data = await getPasswords();
      setPasswords(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      setError('Failed to fetch passwords. Please try again.');
      setLoading(false);
    }
  };

  const handleTogglePassword = async (id, encryptedPassword, iv) => {
    try {
      if (visiblePasswords[id]) {
        // Hide the password if already visible
        setVisiblePasswords(prev => ({ ...prev, [id]: null }));
      } else {
        // Decrypt and show the password
        const decrypted = await decryptPassword(encryptedPassword, iv, masterKey);
        setVisiblePasswords(prev => ({ ...prev, [id]: decrypted }));

        // Auto-hide password after 30 seconds for security
        setTimeout(() => {
          setVisiblePasswords(prev => ({ ...prev, [id]: null }));
        }, 30000);
      }
    } catch (error) {
      console.error('Failed to decrypt password:', error);
      setError('Failed to decrypt password. Try logging in again.');
    }
  };

  const handleDeletePassword = async (id) => {
    if (window.confirm('Are you sure you want to delete this password?')) {
      try {
        await deletePassword(id);
        // Remove the deleted password from the list
        setPasswords(passwords.filter(password => password.id !== id));
      } catch (error) {
        console.error('Failed to delete password:', error);
        setError('Failed to delete password. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Loading your passwords...</p>
      </div>
    );
  }

  return (
    <div className="passwords-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Passwords</h2>
        <Link to="/passwords/add">
          <Button color="success">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add New Password
          </Button>
        </Link>
      </div>

      {error && <Alert color="danger">{error}</Alert>}

      {passwords.length === 0 ? (
        <Card className="text-center p-4">
          <CardBody>
            <CardTitle tag="h5">No passwords found</CardTitle>
            <CardSubtitle className="mb-3 text-muted">
              You haven't stored any passwords yet.
            </CardSubtitle>
            <Link to="/passwords/add">
              <Button color="primary">Add Your First Password</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Row>
          {passwords.map(password => (
            <Col md={6} lg={4} key={password.id} className="mb-4">
              <Card className="password-item h-100">
                <CardBody>
                  <CardTitle tag="h5">{password.website}</CardTitle>
                  <CardSubtitle tag="h6" className="mb-2 text-muted">
                    {password.username}
                  </CardSubtitle>
                  
                  <div className="password-field mt-3">
                    <label className="d-block mb-1">Password:</label>
                    <div className="d-flex align-items-center">
                      <div className="password-value flex-grow-1">
                        {visiblePasswords[password.id] ? (
                          <code className="text-success">{visiblePasswords[password.id]}</code>
                        ) : (
                          <span>••••••••••••••</span>
                        )}
                      </div>
                      <Button 
                        color="secondary"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleTogglePassword(password.id, password.encryptedPassword, password.iv)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 d-flex justify-content-end">
                    <Button 
                      color="danger" 
                      size="sm"
                      onClick={() => handleDeletePassword(password.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default PasswordsList;