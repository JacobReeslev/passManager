import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Alert,
  Card,
  CardBody,
  CardHeader
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { createTestimonial } from '../../services/testimonialService';

const AddTestimonial = () => {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please provide testimonial content');
      return;
    }
    
    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await createTestimonial({
        content,
        rating
      });
      
      // Redirect to testimonials list
      navigate('/testimonials');
    } catch (error) {
      console.error('Failed to add testimonial:', error);
      setError('Failed to add testimonial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Display stars for rating
  const renderRatingStars = () => {
    const stars = [];
    const activeRating = hoverRating || rating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i}
          icon={i <= activeRating ? faStarSolid : faStarRegular}
          className={`star ${i <= activeRating ? 'text-warning' : 'text-secondary'}`}
          style={{ cursor: 'pointer', fontSize: '1.5rem', marginRight: '0.5rem' }}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        />
      );
    }
    
    return stars;
  };

  return (
    <div className="testimonial-form-container">
      <Card>
        <CardHeader className="bg-primary text-white">
          <h2 className="mb-0">Add Testimonial</h2>
        </CardHeader>
        <CardBody>
          {error && <Alert color="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="rating">Rating</Label>
              <div className="rating-stars mb-2">
                {renderRatingStars()}
              </div>
              <small className="text-muted d-block">
                Click on a star to set your rating
              </small>
            </FormGroup>
            
            <FormGroup>
              <Label for="content">Your Testimonial</Label>
              <Input
                type="textarea"
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with the Password Manager..."
                rows={5}
                required
              />
            </FormGroup>
            
            <div className="d-flex justify-content-between">
              <Button
                color="secondary"
                onClick={() => navigate('/testimonials')}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                color="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Testimonial'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddTestimonial;