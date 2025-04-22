# Libraria – Sistema de Controle de Biblioteca

## Visão Geral
Libraria é um sistema web completo para gestão de bibliotecas físicas ou digitais. A interface foi criada em **HTML5 + JavaScript (vanilla)**, estilizada com **Bootstrap 5**, enquanto o back‑end é uma **ASP.NET Core 9 Web API** em **C#** integrada a **SQL Server**. O sistema contempla cadastro de livros, usuários e locações, cálculo de multas, relatórios e autenticação via **JSON Web Tokens (JWT)**.

---

## Endereços de Demonstração
| Serviço | URL |
|---------|-----|
| Front‑end (Bootstrap) | <http://app1.cdxsistemas.com.br:1111> |

| API REST | <http://app1.cdxsistemas.com.br:2222> |

| Swagger (documentação/teste da API) | 

<http://app1.cdxsistemas.com.br:2222/swagger/index.html> |

> ⚠️ Todas as rotas protegidas exigem token JWT no header `Authorization: Bearer <token>`.

---

## Principais Funcionalidades
- **Autenticação & Autorização** — geração e validação de tokens JWT, controle de perfis (Administrador, Usuário).
- **CRUD Completo** — livros, usuários e locações, com paginação e busca.
- **Controle de Multas** — cálculo diário de multas para locações vencidas.
- **Relatórios** — livros mais locados, locações ativas vs. concluídas, etc.
- **Swagger** — playground interativo para testar e documentar a API.
- **Arquitetura em Camadas** — Domain › Application › Infrastructure com Repository Pattern, facilitando testes e manutenção.

---

## Stack Tecnológica
| Camada | Tecnologias |
|--------|-------------|
| **Front‑end** | HTML5, JavaScript ES6, **Bootstrap 5.3**, Chart.js |
| **Back‑end** | **ASP.NET Core 9 Web API**, C#, Entity Framework Core, AutoMapper, JWT, FluentValidation |
| **Banco de Dados** | **SQL Server 2022** |
| **DevOps** | IIS 10, Git, CI/CD (GitHub Actions) |

---

## Estrutura do Repositório
```
Libraria/
├── docs/                # Documentação adicional
├── src/
│   ├── Biblioteca.WebApi/      # Projeto ASP.NET Core 9 (API)
│   ├── Biblioteca.Application/ # Casos de uso e DTOs
│   ├── Biblioteca.Domain/      # Entidades e regras de negócio
│   ├── Biblioteca.Infrastructure/ # Repositórios EF Core, migrations
│   └── web/             # Front‑end estático (Bootstrap + JS)
└── README.md            # Este arquivo
```

---

## Instalação Local
### Pré‑requisitos
- .NET SDK 9+
- SQL Server 2022
- Node.js (opcional, apenas para utilitários de build front‑end)




## Como Gerar & Usar Tokens
1. Envie `POST /api/Login` com e‑mail e senha.
2. Copie o token retornado.
3. Nas demais requisições protegidas, inclua:
```
Authorization: Bearer SEU_TOKEN_AQUI
```
4. Use o Swagger para testar chamadas: clique em **Authorize**, cole o token e execute os endpoints.

---

## Boas Práticas e Padrões Adotados
- **Repository Pattern** para abstração de dados.
- **SOLID** aplicado nas camadas Application e Domain.
- **DTOs + AutoMapper** para isolar modelos de domínio de modelos de transporte.
- **FluentValidation** garantindo regras de entrada.
- **Middleware** para tratamento unificado de exceções e logs.
