public class PasswordEntry
{
    public int Id { get; set; }
    public string Website { get; set; }
    public string Username { get; set; }
    public string EncryptedPassword { get; set; }
    public string IV { get; set; } // Initialization Vector for encryption
    public int UserId { get; set; }
    public User User { get; set; }
}