using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}
    
    public DbSet<User> Users { get; set; }
    public DbSet<PasswordEntry> Passwords { get; set; }
    public DbSet<Testimonial> Testimonials { get; set; }
}