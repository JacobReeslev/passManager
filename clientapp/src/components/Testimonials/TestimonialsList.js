import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Alert, Card, CardBody, Row, Col, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import { getTestimonials } from '../../services/testimonialService';
import { isAuthenticated } from '../../services/authService';

const TestimonialsList = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await getTestimonials();
        setTestimonials(data);
        setError('');
      } catch (err) {
        console.error('Error loading testimonials:', err);
        setError('Failed to load testimonials. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={faStar} 
          className="text-warning me-1" 
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-3">Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div className="testimonials-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Testimonials</h2>
        {isAuthenticated() && (
          <Link to="/testimonials/add">
            <Button color="primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Your Testimonial
            </Button>
          </Link>
        )}
      </div>

      {error && <Alert color="danger">{error}</Alert>}

      {testimonials.length === 0 ? (
        <Card className="text-center p-4">
          <CardBody>
            <h5>No testimonials yet</h5>
            <p>Be the first to share your experience with our Password Manager!</p>
            {isAuthenticated() ? (
              <Link to="/testimonials/add">
                <Button color="primary">Add Testimonial</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button color="primary">Login to Add Testimonial</Button>
              </Link>
            )}
          </CardBody>
        </Card>
      ) : (
        <Row>
          {testimonials.map(testimonial => (
            <Col md={6} key={testimonial.id} className="mb-4">
              <Card className="testimonial-card h-100">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="star-rating">
                      {renderStars(testimonial.rating)}
                    </div>
                    <small className="text-muted">
                      By {testimonial.username}
                    </small>
                  </div>
                  <div className="testimonial-content">
                    <p className="lead">{testimonial.content}</p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {!isAuthenticated() && testimonials.length > 0 && (
        <div className="text-center mt-4">
          <p>Have you tried our Password Manager? We'd love to hear your feedback!</p>
          <Link to="/login">
            <Button color="secondary">Login to Add Your Testimonial</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default TestimonialsList;