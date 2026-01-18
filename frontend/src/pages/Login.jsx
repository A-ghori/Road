import API from "../services/api";

function Login() {
  const login = async () => {
    const res = await API.post("/auth/login", {
      email: "test@mail.com",
      password: "123456",
    });
    localStorage.setItem("token", res.data.token);
  };

  return <button onClick={login}>Login</button>;
}
export default Login;
