using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace passManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestimonialsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TestimonialsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Testimonials
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestimonialDto>>> GetTestimonials()
        {
            var testimonials = await _context.Testimonials
                .Include(t => t.User)
                .Select(t => new TestimonialDto
                {
                    Id = t.Id,
                    Content = t.Content,
                    Rating = t.Rating,
                    Username = t.User.Username
                })
                .ToListAsync();

            return Ok(testimonials);
        }

        // POST: api/Testimonials
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TestimonialDto>> CreateTestimonial(TestimonialCreateDto testimonialDto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var testimonial = new Testimonial
            {
                Content = testimonialDto.Content,
                Rating = testimonialDto.Rating,
                UserId = userId.Value
            };

            _context.Testimonials.Add(testimonial);
            await _context.SaveChangesAsync();

            // Get the username for the response
            var username = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync();

            var result = new TestimonialDto
            {
                Id = testimonial.Id,
                Content = testimonial.Content,
                Rating = testimonial.Rating,
                Username = username ?? "Unknown"
            };

            return CreatedAtAction(nameof(GetTestimonials), result);
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId) ? userId : null;
        }
    }

    public class TestimonialDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Username { get; set; } = string.Empty;
    }

    public class TestimonialCreateDto
    {
        public string Content { get; set; } = string.Empty;
        public int Rating { get; set; }
    }
}