namespace E_Commerce_API.Options
{
    public class JwtOptions
    {
        public string key { get; set; } = string.Empty;
        public string issuer { get; set; } = string.Empty;
        public string audience { get; set; } = string.Empty;
    }
}
