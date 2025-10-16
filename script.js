// Versão simplificada do script para iniciantes
// Esta versão só permite: adicionar tarefas e remover tarefas.
// Comentários explicam o básico: const/let/var, funções e variáveis simples.

// getElementById pega um elemento do HTML pelo seu id.
// Ex: <input id="add_task"> no HTML. Aqui guardamos referência a esse elemento.
const input = document.getElementById('add_task'); // onde o usuário digita
const addBtn = document.getElementById('add_btn'); // botão para adicionar
const taskList = document.getElementById('task_list'); // onde as tarefas aparecem

// Explicando palavras comuns:
// const: cria uma variável que NÃO será reatribuída. Use quando o valor não muda.
// let: cria uma variável que PODE ser reatribuída. Boa para contadores ou temporários.
// var: forma antiga de declarar variável. Evite por enquanto.

// Função simples: cria um item de tarefa (li) com texto e botão de excluir.
function createTask(text) {
    // cria um elemento <li>
    const li = document.createElement('li');
    // coloca o texto dentro do <li>
    li.textContent = text;

    // cria um botão de excluir
    const btn = document.createElement('button');
    btn.textContent = 'Remover';
    // quando clicar no botão, remove a tarefa (o pai do botão)
    btn.addEventListener('click', function() {
        // li é o pai do botão, removemos ele da lista
        taskList.removeChild(li);
    });

    // adiciona o botão dentro do li (após o texto)
    li.appendChild(document.createTextNode(' ')); // espaço antes do botão
    li.appendChild(btn);

    return li;
}

// Função que pega o texto do input e adiciona a tarefa na lista
function addTask() {
    const text = input.value.trim(); // trim remove espaços no começo/fim
    if (text === '') {
        // não deixa adicionar tarefas vazias
        alert('Digite algo antes de adicionar uma tarefa.');
        return;
    }

    const task = createTask(text);
    taskList.appendChild(task);
    input.value = ''; // limpa o campo
    input.focus(); // coloca cursor de volta no input
}

// ligar o botão e a tecla Enter ao adicionar
addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTask();
});

// Pronto! Este script é intencionalmente curto e fácil de ler.
// Coisas a explorar depois (quando estiver confortável):
// - editar tarefas
// - salvar tarefas no navegador (localStorage)
// - marcar como concluída

