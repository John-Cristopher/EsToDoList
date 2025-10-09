// Lógica simples para gerenciar tarefas: adicionar, editar e excluir

const input = document.getElementById('add_task');
const addBtn = document.getElementById('add_btn');
const taskList = document.getElementById('task_list');

function createTaskElement(text) {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-white border border-indigo-100 rounded-lg px-4 py-2';

    const content = document.createElement('div');
    content.className = 'flex items-center gap-4 flex-1';

    const label = document.createElement('span');
    label.textContent = text;
    label.className = 'text-gray-700 break-words';

    content.appendChild(label);

    const actions = document.createElement('div');
    actions.className = 'flex gap-2 items-center';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏';
    editBtn.className = 'bg-yellow-300 hover:bg-yellow-400 text-gray-800 px-3 py-1 rounded';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑';
    deleteBtn.className = 'bg-red-300 hover:bg-red-400 text-white px-3 py-1 rounded';

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(content);
    li.appendChild(actions);

    // Editar: transformar o label em input com salvar/cancelar
    editBtn.addEventListener('click', () => {
        startEdit(li, label, editBtn);
    });

    // Excluir: remover a li
    deleteBtn.addEventListener('click', () => {
        taskList.removeChild(li);
    });

    return li;
}

function startEdit(li, label, editBtn) {
    const originalText = label.textContent;

    const inputEdit = document.createElement('input');
    inputEdit.type = 'text';
    inputEdit.value = originalText;
    inputEdit.className = 'border rounded px-2 py-1 w-full';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar';
    saveBtn.className = 'bg-green-400 hover:bg-green-500 text-white px-3 py-1 rounded';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded';

    // substituir conteúdo visual
    const contentDiv = li.querySelector('div');
    contentDiv.replaceChild(inputEdit, label);

    const actionsDiv = li.querySelector('div + div');
    // esconder botões antigos e adicionar salvar/cancelar
    actionsDiv.style.display = 'none';

    const editArea = document.createElement('div');
    editArea.className = 'flex gap-2';
    editArea.appendChild(saveBtn);
    editArea.appendChild(cancelBtn);
    li.appendChild(editArea);

    inputEdit.focus();

    function finishSave() {
        const newValue = inputEdit.value.trim();
        if (!newValue) {
            // não permitir salvar vazio
            alert('A tarefa não pode ficar vazia.');
            inputEdit.focus();
            return;
        }
        label.textContent = newValue;
        cleanup();
    }

    function cleanup() {
        // restaurar estrutura
        li.removeChild(editArea);
        actionsDiv.style.display = '';
        contentDiv.replaceChild(label, inputEdit);
    }

    saveBtn.addEventListener('click', finishSave);
    cancelBtn.addEventListener('click', () => {
        cleanup();
    });

    inputEdit.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finishSave();
        if (e.key === 'Escape') cleanup();
    });
}

function addTaskFromInput() {
    const text = input.value.trim();
    if (!text) return;

    const taskEl = createTaskElement(text);
    taskList.appendChild(taskEl);
    input.value = '';
    input.focus();
}

addBtn.addEventListener('click', addTaskFromInput);

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTaskFromInput();
});

// Optional: sample task to demonstrate UI
// taskList.appendChild(createTaskElement('Exemplo: Estudar JavaScript'));