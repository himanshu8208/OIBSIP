def calculate_bmi(weight, height):
    # BMI formula: weight (kg) / height (m)^2
    bmi = weight / (height ** 2)
    return bmi

def bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif 18.5 <= bmi < 25:
        return "Normal weight"
    elif 25 <= bmi < 30:
        return "Overweight"
    else:
        return "Obese"

def main():
    print("=== BMI Calculator ===")
    try:
        weight = float(input("Enter your weight in kg: "))
        height = float(input("Enter your height in meters: "))

        bmi = calculate_bmi(weight, height)
        category = bmi_category(bmi)

        print(f"\nYour BMI is: {bmi:.2f}")
        print(f"You are classified as: {category}")
    except ValueError:
        print("Please enter valid numeric input.")

if __name__ == "__main__":
    main()
