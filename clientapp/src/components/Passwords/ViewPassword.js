import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Alert, 
  Spinner, 
  Card, 
  CardBody,
  CardTitle
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faSave, faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getPassword, updatePassword, deletePassword } from '../../services/passwordService';
import { encryptPassword, decryptPassword } from '../../services/encryptionService';

const ViewPassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [masterKey, setMasterKey] = useState(null);
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [encryptedDetails, setEncryptedDetails] = useState({
    encryptedPassword: '',
    iv: ''
  });

  // Load master key and password data
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Import the master key
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

        // 2. Fetch password data
        const passwordData = await getPassword(id);
        setWebsite(passwordData.website);
        setUsername(passwordData.username);
        setEncryptedDetails({
          encryptedPassword: passwordData.encryptedPassword,
          iv: passwordData.iv
        });

        // 3. Try to decrypt the password
        try {
          const decrypted = await decryptPassword(
            passwordData.encryptedPassword,
            passwordData.iv,
            key
          );
          setDecryptedPassword(decrypted);
        } catch (decryptError) {
          console.error('Failed to decrypt password:', decryptError);
          setError('Could not decrypt the password. The encryption key may be incorrect.');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading password:', error);
        setError('Failed to load password details.');
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
    
    // Auto-hide after 30 seconds for security
    if (!showPassword) {
      setTimeout(() => {
        setShowPassword(false);
      }, 30000);
    }
  };

  const handleEditMode = () => {
    if (!editMode) {
      // When entering edit mode, set the password field to the decrypted value
      setPassword(decryptedPassword);
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    if (!masterKey) {
      setError('Encryption key not available. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Only re-encrypt if the password was changed
      let updatedEncryptedDetails = encryptedDetails;
      
      if (password !== decryptedPassword) {
        // Encrypt the new password
        updatedEncryptedDetails = await encryptPassword(password, masterKey);
      }
      
      // Update the password entry
      await updatePassword(id, {
        id: parseInt(id),
        website,
        username,
        encryptedPassword: updatedEncryptedDetails.encryptedPassword,
        iv: updatedEncryptedDetails.iv
      });

      // Update component state
      setEncryptedDetails(updatedEncryptedDetails);
      setDecryptedPassword(password);
      setEditMode(false);
      
    } catch (error) {
      console.error('Failed to update password:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this password? This action cannot be undone.')) {
      try {
        setLoading(true);
        await deletePassword(id);
        navigate('/passwords');
      } catch (error) {
        console.error('Failed to delete password:', error);
        setError('Failed to delete password. Please try again.');
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Loading password details...</p>
      </div>
    );
  }

  return (
    <div className="password-view">
      <div className="d-flex align-items-center mb-4">
        <Button 
          color="secondary" 
          className="me-2" 
          onClick={() => navigate('/passwords')}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Back to Passwords
        </Button>
        <h2 className="mb-0 ms-3">Password Details</h2>
      </div>

      {error && <Alert color="danger">{error}</Alert>}

      <Card className="mb-4">
        <CardBody>
          {!editMode ? (
            <>
              <div className="mb-4">
                <Label className="fw-bold">Website / Application:</Label>
                <div>{website}</div>
              </div>

              <div className="mb-4">
                <Label className="fw-bold">Username / Email:</Label>
                <div>{username}</div>
              </div>

              <div className="mb-4">
                <Label className="fw-bold">Password:</Label>
                <div className="d-flex align-items-center">
                  <div className="password-value flex-grow-1">
                    {showPassword ? (
                      <code className="text-success">{decryptedPassword}</code>
                    ) : (
                      <span>••••••••••••••</span>
                    )}
                  </div>
                  <Button 
                    color="secondary"
                    size="sm"
                    className="ms-2"
                    onClick={handleTogglePassword}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </Button>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <Button 
                  color="primary" 
                  onClick={handleEditMode}
                >
                  Edit Details
                </Button>
                <Button 
                  color="danger" 
                  onClick={handleDelete}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Delete Password
                </Button>
              </div>
            </>
          ) : (
            <Form>
              <FormGroup>
                <Label for="website">Website / Application</Label>
                <Input
                  type="text"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label for="username">Username / Email</Label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label for="password">Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button 
                  type="button"
                  color="link" 
                  size="sm"
                  className="mt-1"
                  onClick={handleTogglePassword}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} /> 
                  {showPassword ? "Hide Password" : "Show Password"}
                </Button>
              </FormGroup>

              <div className="d-flex justify-content-between mt-4">
                <Button 
                  color="secondary" 
                  onClick={handleEditMode}
                  disabled={loading}
                >
                  Cancel
                </Button>
                
                <Button 
                  color="primary" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ViewPassword;