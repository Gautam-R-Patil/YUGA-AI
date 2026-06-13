import axios from "axios";

async function test() {
    try {
        const response = await axios.post("http://localhost:5000/api/auth/login", {
            email: "student@test.com",
            password: "password123"
        });
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.log("Error Status:", err.response.status);
            console.log("Error Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Error:", err.message);
        }
    }
}

test();
