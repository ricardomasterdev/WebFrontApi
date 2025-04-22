let usuario = getUsuarioAutenticado();

if (!usuario || usuario.perfil !== 0) {
  alert("Acesso restrito ao perfil administrador.");
  localStorage.removeItem("token");
  window.location.href = "index.html";
}