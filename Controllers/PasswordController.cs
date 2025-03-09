using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace passManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PasswordsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PasswordsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Passwords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PasswordEntryDto>>> GetPasswords()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var passwords = await _context.Passwords
                .Where(p => p.UserId == userId.Value)
                .Select(p => new PasswordEntryDto
                {
                    Id = p.Id,
                    Website = p.Website,
                    Username = p.Username,
                    EncryptedPassword = p.EncryptedPassword,
                    IV = p.IV
                })
                .ToListAsync();

            return Ok(passwords);
        }

        // GET: api/Passwords/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PasswordEntryDto>> GetPassword(int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var password = await _context.Passwords
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId.Value);

            if (password == null)
            {
                return NotFound();
            }

            return new PasswordEntryDto
            {
                Id = password.Id,
                Website = password.Website,
                Username = password.Username,
                EncryptedPassword = password.EncryptedPassword,
                IV = password.IV
            };
        }

        // POST: api/Passwords
        [HttpPost]
        public async Task<ActionResult<PasswordEntry>> CreatePassword(PasswordEntryDto passwordDto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var passwordEntry = new PasswordEntry
            {
                Website = passwordDto.Website,
                Username = passwordDto.Username,
                EncryptedPassword = passwordDto.EncryptedPassword,
                IV = passwordDto.IV,
                UserId = userId.Value
            };

            _context.Passwords.Add(passwordEntry);
            await _context.SaveChangesAsync();

            passwordDto.Id = passwordEntry.Id;
            return CreatedAtAction(nameof(GetPassword), new { id = passwordEntry.Id }, passwordDto);
        }

        // PUT: api/Passwords/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePassword(int id, PasswordEntryDto passwordDto)
        {
            if (id != passwordDto.Id)
            {
                return BadRequest();
            }

            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var passwordEntry = await _context.Passwords
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId.Value);

            if (passwordEntry == null)
            {
                return NotFound();
            }

            passwordEntry.Website = passwordDto.Website;
            passwordEntry.Username = passwordDto.Username;
            passwordEntry.EncryptedPassword = passwordDto.EncryptedPassword;
            passwordEntry.IV = passwordDto.IV;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PasswordExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Passwords/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePassword(int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var password = await _context.Passwords
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId.Value);
            
            if (password == null)
            {
                return NotFound();
            }

            _context.Passwords.Remove(password);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PasswordExists(int id)
        {
            return _context.Passwords.Any(e => e.Id == id);
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId) ? userId : null;
        }
    }

    public class PasswordEntryDto
    {
        public int Id { get; set; }
        public string Website { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string EncryptedPassword { get; set; } = string.Empty;
        public string IV { get; set; } = string.Empty;
    }
}