// Define o endpoint base da API
const endpoint = 'https://jsonplaceholder.typicode.com';

let lastCommentOpened = []; // Array que armazena os IDs dos posts cujos comentários foram abertos
let users = [];  // Array para armazenar os dados dos usuários
let userMap = {};  // Objeto para mapear o id de cada usuário ao objeto do usuário correspondente

// Função para buscar os comentários de um post específico
const getCommentsByPost = (postId) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${endpoint}/comments?postId=${postId}`, true);

    xhr.onload = function() {
        const comments = document.getElementById(`comment-${postId}`);
        let output = '';

        if(lastCommentOpened.includes(postId)){
            comments.style.display = 'none';
            comments.innerHTML = '';
            lastCommentOpened = lastCommentOpened.filter(id => id !== postId);
        } else if (xhr.status === 200) {
            lastCommentOpened.push(postId);
            const response = JSON.parse(xhr.responseText);
            
            response.forEach(comment => {
                output += `<div style="margin:0 0 10px 0"><div>${comment.email}</div><div>${comment.body}</div></div>`;
            });

            comments.style.display = 'block';
            comments.style.padding = '10px';
            comments.innerHTML = output;
        }
    }

    xhr.send();
}

// Função para obter todos os usuários
const getAllUsers = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${endpoint}/users`, true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            users = response;
            userMap = users.reduce((acc = {}, user) => {
                acc[user.id] = user;
                return acc;
            }, {});
        } else {
            console.error('Erro ao fazer a requisição.');
        }
    };

    xhr.onerror = function() {
        console.error('Erro na conexão.');
    };

    xhr.send();
}

// Função para construir o cabeçalho de cada post
const buildPostHeader = (username) => `<div class='post-header'>
<div>
<span class="material-symbols-outlined">
account_circle
</span>
</div>
<span>${username}</span>
</div>`;

// Função para obter todos os posts
const getAllPosts = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `${endpoint}/posts`, true);

            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    let output = '';
                    response.forEach(post => {
                        const user = userMap[post.userId];
                        output += `<div class='post-card'>
                        ${buildPostHeader(user?.username || 'Desconhecido')}
                        <div style="font-weight: bold; font-size: 16px;"> ${post.title}</div>
                        <div>${post.body}</div>
                        <div class="post-actions">
                            <div class="left-actions">
                                <span class="material-symbols-outlined like-icon" onclick="toggleLike(this)">
                                    favorite
                                </span>
                                <span class="material-symbols-outlined" onclick="getCommentsByPost(${post.id})">
                                    comment
                                </span>
                            </div>
                            <div class="right-actions">
                                <span class="material-symbols-outlined">
                                    share
                                </span>
                            </div>
                        </div>
                        <div id="comment-${post.id}"></div>
                      </div>`;
                    });
                    document.getElementById('content').innerHTML = output;
                    document.getElementById('content').style.display = 'flex';
                } else {
                    console.error('Erro ao fazer a requisição.');
                }
            };

            xhr.onerror = function() {
                console.error('Erro na conexão.');
            };

            xhr.send();
            resolve('success');
        }, 100); // Simula 100ms de delay
    })
}

// Função para implementar o autocomplete
const autocomplete = (inp) => {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
    
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
      
        const regex = new RegExp(val, 'i');
        
        for (const user of users) {
            if (regex.test(user?.username)) {
                b = document.createElement("DIV");
                b.innerHTML = "<strong>" + user?.username.substr(0, val.length) + "</strong>";
                b.innerHTML += user?.username.substr(val.length);
                b.innerHTML += "<input type='hidden' value='" + user?.username + "'>";
                b.addEventListener("click", function(e) {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });

    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });

    const addActive = (x) => {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
  }

  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

// Função que é executada quando a página é carregada
window.onload = async function() {
  getAllUsers();
  autocomplete(document.getElementById("myInput"));
  await getAllPosts();
};

// Função para abrir o modal (menu lateral)
function toggleSidebar() {
  var sidePanel = document.getElementById('sidePanel');
  sidePanel.classList.toggle('open');
}

// Função para abrir o modal de formulário
function openModal() {
  const modal = document.getElementById("modal");
  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("show");
}

// Fecha o modal se o usuário clicar fora da área do modal
window.onclick = function(event) {
  var modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
}
window.addEventListener("click", function (event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
});

// Função chamada quando o formulário é enviado
function submitForm(event) {
  event.preventDefault();
  const title = document.getElementById('title').value;
  const text = document.getElementById('text').value;
  
  console.log('Título:', title);
  console.log('Texto:', text);

  closeModal();
}

// Função para alternar o estado do "like" nos posts
function toggleLike(icon) {
  icon.classList.toggle('liked');
}

// Função para compartilhar o post (simula copiar o link do post)
function sharePost(postId) {
  const dummyUrl = `https://meusite.com/post/${postId}`;
  navigator.clipboard.writeText(dummyUrl).then(() => {
    alert("Link copiado para a área de transferência!");
  });
}
