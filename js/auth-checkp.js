let usuario = getUsuarioAutenticado();

if (!usuario || usuario.perfil !== 1) {
  alert("Acesso restrito ao perfil Usuario Padrão");
  localStorage.removeItem("token");
  window.location.href = "index.html";
}