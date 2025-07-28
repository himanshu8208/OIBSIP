import random
import string

def generate_password(length=12):
    # Define character sets
    letters = string.ascii_letters  # a-z + A-Z
    digits = string.digits          # 0-9
    symbols = string.punctuation    # Special characters: !@#$%^&*() etc.

    # Combine all character sets
    all_chars = letters + digits + symbols

    # Ensure at least one character from each set is included
    password = [
        random.choice(letters),
        random.choice(digits),
        random.choice(symbols)
    ]

    # Fill the rest of the password length
    password += random.choices(all_chars, k=length - 3)

    # Shuffle to avoid predictable patterns
    random.shuffle(password)

    return ''.join(password)

def main():
    print("=== Password Generator ===")
    try:
        length = int(input("Enter desired password length (min 6): "))
        if length < 6:
            print("Password length should be at least 6 characters.")
        else:
            password = generate_password(length)
            print(f"Generated password: {password}")
    except ValueError:
        print("Please enter a valid number.")

if __name__ == "__main__":
    main()
