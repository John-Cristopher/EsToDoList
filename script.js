// =============================================================
//  Remake Tarefas Minimalista - CRUD básico de tarefas
//  Adaptação do JS_MODELO para o MEU_HTML_INDIVIDUAL
//  Foco em Clean Code, Padrões e Adaptação de Seletores
// =============================================================

// -------------------------------
// 1. Selecionar os elementos da página
//    (Seletores adaptados para o MEU_HTML_INDIVIDUAL)
// -------------------------------
const campoNovaTarefa = document.getElementById('task-input'); // Era 'nova-tarefa-input'
const formularioTarefa = document.getElementById('task-form'); // Novo elemento: o formulário
const listaTarefas = document.getElementById('task-list-container'); // Era 'lista-de-tarefas'
const campoPesquisa = document.getElementById('search-input'); // Era 'pesquisa-input'
const seletorFiltro = document.getElementById('filter-select'); // Era 'filtro-select'
const modal = document.getElementById('custom-modal');
const modalTitulo = document.getElementById('modal-title');
const modalMensagem = document.getElementById('modal-message');
const modalInput = document.getElementById('modal-input');
const botaoCancelar = document.getElementById('modal-cancel-btn');
const botaoConfirmar = document.getElementById('modal-confirm-btn');

// Array principal que armazenará todas as tarefas
let tarefas = [];
let modalResolver;

// Nome da chave do localStorage adaptado
const STORAGE_KEY = 'minimalistTasks';

// -------------------------------
// 2. Carregar tarefas salvas no navegador (localStorage)
// -------------------------------
function carregarTarefasSalvas() {
    const tarefasSalvas = localStorage.getItem(STORAGE_KEY);
    if (tarefasSalvas) {
        // Converte o texto JSON salvo em um array de objetos
        tarefas = JSON.parse(tarefasSalvas);
        exibirTarefas(tarefas);
    }
}

// -------------------------------
// 3. Salvar as tarefas no navegador
// -------------------------------
function salvarTarefas() {
    // Converte o array de objetos em uma string JSON para salvar
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
}

// -------------------------------
// 4. Função para adicionar uma nova tarefa
// -------------------------------
async function adicionarTarefa(evento) {
    // Impede o recarregamento da página que é o comportamento padrão do submit de um formulário
    evento.preventDefault();

    const texto = campoNovaTarefa.value.trim(); // remove espaços extras

    if (texto === '') {
        { await mostrarModal('Atenção!', 'Por favor, digite o que precisa ser feito.'); return; }
    }

    // Objeto representando a tarefa
    const novaTarefa = {
        id: Date.now(), // Cria um número único com base no tempo atual
        texto: texto,
        concluida: false
    };

    // Adiciona ao array e salvamos
    tarefas.push(novaTarefa);
    salvarTarefas();

    // Atualiza a lista exibida
    exibirTarefas(tarefas);

    // Limpa o campo de texto
    campoNovaTarefa.value = '';
}

// -------------------------------
// 5. Função para exibir as tarefas na tela
//    (Adaptação do HTML/Classes Tailwind)
// -------------------------------
function exibirTarefas(listaParaMostrar) {
    // Limpam a lista antes de mostrar novamente, garantindo que o template não seja removido
    // Usa querySelectorAll e filter para limpar apenas os itens de tarefa, mantendo o template
    listaTarefas.querySelectorAll('.task-item:not(#task-template)').forEach(item => item.remove());

    // Percorre todas as tarefas do array
    for (let tarefa of listaParaMostrar) {
        // Clona o template do HTML para criar um novo item de tarefa
        const item = document.getElementById('task-template').cloneNode(true);
        item.id = `task-${tarefa.id}`; // Define um ID único
        item.classList.remove('hidden'); // Torna o item visível
        item.classList.add('task-item-active'); // Adiciona uma classe para identificar o item ativo

        // Adicion classes de estilo de conclusão, se for o caso
        if (tarefa.concluida) {
            // Adiciona a classe de fundo concluído e remove a borda normal
            item.classList.add('bg-concluido-bg', 'border-verde-musgo');
            item.classList.remove('bg-white', 'border-verde-sutil');

            // Encontra o span do texto
            const textoTarefa = item.querySelector('.task-text');
            // Adiciona o traço no texto
            textoTarefa.classList.add('line-through', 'text-verde-musgo/60', 'italic');

            // Encontra o botão de check e ajusta o título para desmarcar
            const doneBtn = item.querySelector('.done-btn');
            doneBtn.title = 'Marcar como Não Concluída';
            doneBtn.querySelector('i').classList.remove('fa-check');
            doneBtn.querySelector('i').classList.add('fa-undo'); // Icone para desfazer
        } else {
            // Remove o traço no texto
            const textoTarefa = item.querySelector('.task-text');
            textoTarefa.classList.remove('line-through', 'text-verde-musgo/60', 'italic');
        }

        // Configura o texto
        const textoTarefa = item.querySelector('.task-text');
        textoTarefa.textContent = tarefa.texto;

        // Configura os eventos dos botões, usando querySelector
        item.querySelector('.edit-btn').onclick = function () {
            editarTarefa(tarefa.id);
        };

        // O botão 'done-btn' agora lida com a alternância
        item.querySelector('.done-btn').onclick = function () {
            alternarConclusao(tarefa.id);
        };

        item.querySelector('.remove-btn').onclick = function () {
            excluirTarefa(tarefa.id);
        };

        // Adiciona o novo item à lista
        listaTarefas.appendChild(item);
    }
}

// -------------------------------
// 6. Função para alternar entre concluída e ativa (done/todo)
// -------------------------------
function alternarConclusao(id) {
    // Percorre o array e inverte o status de 'concluida'
    for (let tarefa of tarefas) {
        if (tarefa.id === id) {
            tarefa.concluida = !tarefa.concluida;
            break; // Sai do loop após encontrar a tarefa
        }
    }
    salvarTarefas();
    // Chama a pesquisa/filtro novamente para que o item suma da tela se o filtro 'done' ou 'todo' estiver ativo
    aplicarFiltroEPesquisa();
}

// -------------------------------
// 7. Função para editar o texto de uma tarefa
// -------------------------------
async function editarTarefa(id) {
    // Busca a tarefa atual para pré-preencher o prompt
    const tarefaAtual = tarefas.find(t => t.id === id);
    if (!tarefaAtual) return;

    const novaDescricao = await mostrarModal(
        'Editar Tarefa',
        'Modifique o texto da tarefa abaixo:',
        true, // Usa Input (true)
        tarefaAtual.texto // Valor Inicial
    );

    if (novaDescricao === null || novaDescricao.trim() === '') {
        return; // se cancelar ou deixar em branco, não faz nada
    }

    // Atualiza o texto da tarefa
    tarefaAtual.texto = novaDescricao.trim();

    salvarTarefas();
    // Não precisa de exibirTarefas(tarefas), pois a pesquisa/filtro faz isso
    aplicarFiltroEPesquisa();
}

// -------------------------------
// 8. Função para excluir uma tarefa
// -------------------------------
async function excluirTarefa(id) {
    const confirmar = await mostrarModal(
        'Confirmação Necessária',
        'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
        false // Não usa Input (false)
    );

    if (confirmar) {
        // Filtra o array, mantendo apenas as tarefas que NÃO têm o ID fornecido
        tarefas = tarefas.filter(function (tarefa) {
            return tarefa.id !== id;
        });
        salvarTarefas();
        // Chama a pesquisa/filtro novamente para atualizar a lista
        aplicarFiltroEPesquisa();
    }
}

// -------------------------------
// 9. Função de pesquisa
// -------------------------------
function pesquisarTarefas(lista) {
    const termo = campoPesquisa.value.toLowerCase();

    // Filtra a lista recebida (que já pode estar filtrada pelo status)
    return lista.filter(function (tarefa) {
        return tarefa.texto.toLowerCase().includes(termo);
    });
}

// -------------------------------
// 10. Filtro: todos / done / todo (concluídos / a fazer)
// -------------------------------
function filtrarTarefas() {
    const tipo = seletorFiltro.value;
    let filtradas = tarefas; // Começa com todas as tarefas

    if (tipo === 'done') {
        // Filtra apenas as concluídas
        filtradas = tarefas.filter(tarefa => tarefa.concluida);
    } else if (tipo === 'todo') {
        // Filtra apenas as não concluídas (a fazer)
        filtradas = tarefas.filter(tarefa => !tarefa.concluida);
    }

    // Retorna a lista filtrada pelo status
    return filtradas;
}

// -------------------------------
// 10.1. Função para combinar pesquisa e filtro
// -------------------------------
function aplicarFiltroEPesquisa() {
    // 1. Aplica o filtro de status (todo/done/all)
    let listaFiltrada = filtrarTarefas();

    // 2. Aplica a pesquisa (termo de busca)
    listaFiltrada = pesquisarTarefas(listaFiltrada);

    // 3. Exibe o resultado final
    exibirTarefas(listaFiltrada);
}


// -------------------------------
// 11. Eventos (interações do usuário)
// -------------------------------
// O evento é no SUBMIT do formulário, não no clique do botão
formularioTarefa.addEventListener('submit', adicionarTarefa);
// O campo de pesquisa agora chama a função combinada
campoPesquisa.addEventListener('input', aplicarFiltroEPesquisa);
// O seletor de filtro agora chama a função combinada
seletorFiltro.addEventListener('change', aplicarFiltroEPesquisa);

// -------------------------------
// 13. Quando a página carregar, buscamos as tarefas salvas
// -------------------------------
window.onload = function () {
    carregarTarefasSalvas();
    configurarListenersModal();
}


// -------------------------------
// 14. Função de Abstração para Modais (Substitui alert/prompt/confirm)
// -------------------------------

/**
 * Exibe o modal customizado para diferentes tipos de interação.
 * @param {string} titulo - Título do modal.
 * @param {string} mensagem - Mensagem ou instrução.
 * @param {boolean} [usaInput=false] - Se deve mostrar o campo de input (para editar).
 * @param {string} [valorInicial=''] - Valor inicial do campo de input.
 * @returns {Promise<string|boolean>} - Retorna o texto do input (se for prompt) ou true/false (se for confirm).
 */
function mostrarModal(titulo, mensagem, usaInput = false, valorInicial = '') {
    return new Promise((resolve) => {
        // 1. Configurações visuais
        modalTitulo.textContent = titulo;
        modalMensagem.textContent = mensagem;

        // 2. Lógica do Input (para prompts de edição)
        if (usaInput) {
            modalInput.classList.remove('hidden');
            modalInput.value = valorInicial;
            modalInput.focus(); // Foca no campo para digitação imediata
            modalMensagem.classList.add('hidden'); // Esconde a mensagem em caso de input
        } else {
            modalInput.classList.add('hidden');
            modalMensagem.classList.remove('hidden');
        }

        // 3. Reseta e Exibe o Modal
        // Clona para remover todos os event listeners anteriores e evitar duplicação
        const novoBotaoConfirmar = botaoConfirmar.cloneNode(true);
        botaoConfirmar.parentNode.replaceChild(novoBotaoConfirmar, botaoConfirmar);

        const novoBotaoCancelar = botaoCancelar.cloneNode(true);
        botaoCancelar.parentNode.replaceChild(novoBotaoCancelar, botaoCancelar);

        // Exibe a div principal
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Volta a ser flex para centralizar

        // 4. Configuração dos Eventos (Promise)

        // Resolve com o valor do input (ou true para confirmação)
        novoBotaoConfirmar.onclick = function () {
            modal.classList.add('hidden');
            // Se usou input (prompt), retorna o texto, senão retorna true (confirm)
            resolve(usaInput ? modalInput.value : true);
        };

        // Resolve com null (se for prompt) ou false (se for confirm)
        novoBotaoCancelar.onclick = function () {
            modal.classList.add('hidden');
            // Retorna null para cancelar o prompt, ou false para cancelar o confirm
            resolve(usaInput ? null : false);
        };
    });
}

// -------------------------------
// 14.1. Configuração Única dos Listeners do Modal
// -------------------------------

/**
 * Anexa os ouvintes de evento permanentes aos botões do modal.
 * Esta função é chamada apenas uma vez, na inicialização.
 */
function configurarListenersModal() {
    // Listener do Botão Confirmar/OK
    botaoConfirmar.addEventListener('click', () => {
        if (!modalResolver) return; // Se não houver Promise ativa, ignora

        modal.classList.add('hidden');
        // Verifica se o modal estava em modo input (prompt) ou confirmação (confirm)
        const usaInput = !modalInput.classList.contains('hidden');

        // Resolve com o valor do input (ou true para confirmação)
        modalResolver(usaInput ? modalInput.value : true);
        modalResolver = null; // Limpa o resolver para a próxima Promise
    });

    // Listener do Botão Cancelar/Fechar
    botaoCancelar.addEventListener('click', () => {
        if (!modalResolver) return; // Se não houver Promise ativa, ignora

        modal.classList.add('hidden');
        const usaInput = !modalInput.classList.contains('hidden');

        // Resolve com null (se for prompt) ou false (se for confirm)
        modalResolver(usaInput ? null : false);
        modalResolver = null; // Limpa o resolver
    });
}

// -------------------------------
// 14.2. Função de Abstração para Modais (Simplificada)
// -------------------------------

/**
 * Exibe o modal customizado.
 * @returns {Promise<string|boolean>}
 */
function mostrarModal(titulo, mensagem, usaInput = false, valorInicial = '') {
    return new Promise((resolve) => {
        modalResolver = resolve; // <--- Armazena a função resolve para ser chamada pelos listeners

        // 1. Configurações visuais
        modalTitulo.textContent = titulo;
        modalMensagem.textContent = mensagem;

        // 2. Lógica do Input (para prompts de edição)
        if (usaInput) {
            modalInput.classList.remove('hidden');
            modalMensagem.classList.add('hidden'); // Esconde a mensagem em caso de input
            modalInput.value = valorInicial;
            modalInput.focus();
        } else {
            modalInput.classList.add('hidden');
            modalMensagem.classList.remove('hidden');
        }

        // 3. Exibe o Modal (sem a necessidade de clonagem)
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });
}