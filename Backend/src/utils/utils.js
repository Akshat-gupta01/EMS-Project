function generateOtp(){
    return Math.floor(1000 + Math.random() * 9000).toString()
}

function getOtpHtml(otp){
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
    
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f7f6;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        color: #333;
    }
    .container {
        background-color: #ffffff;
        padding: 40px 60px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        text-align: center;
        border-top: 5px solid #007bff;
    }
    h2 {
        color: #007bff;
        margin-bottom: 20px;
        font-weight: 700;
    }
    .otp-box {
        background-color: #e8f0ff;
        border: 2px solid #007bff;
        padding: 20px 40px;
        border-radius: 8px;
        font-size: 32px;
        font-weight: 700;
        color: #007bff;
        margin: 30px 0;
        letter-spacing: 5px;
    }
    .note {
        color: #666;
        font-size: 14px;
        margin-top: 20px;
    }
    .note-bold {
        font-weight: 600;
        color: #333;
    }
</style>
</head>
<body>
    <h2>Your One-Time Password (OTP) is: ${otp}</h2>
    <p>Please use this code to verify your identity.</p>
    <p>This OTP will expire in 10 minutes.</p>
    <p>Do not share this code with anyone.</p>
</body>
</html>`;
}

module.exports={generateOtp,getOtpHtml}