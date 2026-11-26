const numeroSenha = document.querySelector('.parametro-senha__texto');
let tamanhoSenha = 12;
numeroSenha.textContent = tamanhoSenha;

const letrasMaiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const letrasMinusculas = 'abcdefghijklmnopqrstuvwxyz';
const numeros = '0123456789';
const simbolos = '!@#$%&*?_-+=';
const botoes = document.querySelectorAll('.parametro-senha__botao');
const campoSenha = document.querySelector('#campo-senha');
const checkbox = document.querySelectorAll('.checkbox');
const forcaSenha = document.querySelector('#barra-forca');
const valorEntropia = document.querySelector('#estimativa');
const avisoOpcoes = document.querySelector('#aviso-opcoes');
const botaoCopiar = document.querySelector('#copiar-senha');
const mensagemCopia = document.querySelector('#mensagem-copia');

botoes[0].onclick = diminuiTamanho;
botoes[1].onclick = aumentaTamanho;

for (let i = 0; i < checkbox.length; i++) {
    checkbox[i].addEventListener('change', geraSenha);
}

function diminuiTamanho() {
    if (tamanhoSenha > 1) tamanhoSenha--;
    numeroSenha.textContent = tamanhoSenha;
    geraSenha();
}

function aumentaTamanho() {
    if (tamanhoSenha < 20) tamanhoSenha++;
    numeroSenha.textContent = tamanhoSenha;
    geraSenha();
}

function geraSenha() {
    let alfabeto = '';
    if (checkbox[0].checked) alfabeto += letrasMaiusculas;
    if (checkbox[1].checked) alfabeto += letrasMinusculas;
    if (checkbox[2].checked) alfabeto += numeros;
    if (checkbox[3].checked) alfabeto += simbolos;

    if (!alfabeto.length) {
        campoSenha.value = '';
        avisoOpcoes.textContent = 'Selecione ao menos uma característica para gerar uma senha.';
        classificaSenha(0);
        return;
    }
    avisoOpcoes.textContent = '';

    let senha = '';
    // Usa fonte criptograficamente segura quando disponível.
    const randomValues = new Uint32Array(tamanhoSenha);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(randomValues);
        for (let i = 0; i < tamanhoSenha; i++) {
            senha += alfabeto[randomValues[i] % alfabeto.length];
        }
    } else {
        for (let i = 0; i < tamanhoSenha; i++) {
            senha += alfabeto[Math.floor(Math.random() * alfabeto.length)];
        }
    }

    campoSenha.value = senha;
    classificaSenha(alfabeto.length);
}

function classificaSenha(tamanhoAlfabeto) {
    forcaSenha.classList.remove('fraca', 'media', 'forte');
    if (tamanhoAlfabeto <= 0) {
        forcaSenha.classList.add('fraca');
        valorEntropia.textContent = 'A entropia será calculada quando você selecionar opções.';
        return;
    }

    const entropia = tamanhoSenha * Math.log2(tamanhoAlfabeto);
    if (entropia > 57) {
        forcaSenha.classList.add('forte');
    } else if (entropia > 35) {
        forcaSenha.classList.add('media');
    } else {
        forcaSenha.classList.add('fraca');
    }

    // Estimativa ilustrativa de tempo de busca a 100 milhões de tentativas por segundo.
    const segundos = Math.pow(2, entropia) / (100e6);
    const dias = segundos / (60 * 60 * 24);
    let estimativa;
    if (dias < 1) {
        const horas = segundos / 3600;
        estimativa = horas < 1 ? 'menos de 1 hora' : `${Math.floor(horas)} hora(s)`;
    } else if (dias < 365) {
        estimativa = `${Math.floor(dias)} dia(s)`;
    } else {
        const anos = dias / 365;
        estimativa = anos >= 1e9 ? 'bilhões de anos' : `${Math.floor(anos)} ano(s)`;
    }
    valorEntropia.textContent = `Entropia estimada: ${entropia.toFixed(1)} bits. Um computador levaria aproximadamente ${estimativa} em uma busca teórica.`;
}

botaoCopiar.addEventListener('click', async () => {
    if (!campoSenha.value) {
        mensagemCopia.textContent = 'Gere uma senha antes de copiar.';
        return;
    }
    try {
        await navigator.clipboard.writeText(campoSenha.value);
        mensagemCopia.textContent = 'Senha copiada!';
    } catch (erro) {
        campoSenha.focus();
        campoSenha.select();
        const copiado = document.execCommand('copy');
        mensagemCopia.textContent = copiado ? 'Senha copiada!' : 'Selecione e copie a senha manualmente.';
    }
});

geraSenha();
