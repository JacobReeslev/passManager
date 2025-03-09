using System.ComponentModel.DataAnnotations.Schema;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    
    [Column(TypeName = "text")]
    public string PasswordHash { get; set; }

    [Column(TypeName = "text")]
    public string Salt { get; set; }

    public List<PasswordEntry> Passwords { get; set; }
}