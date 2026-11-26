const campoSenha = document.querySelector("#campo-senha");

const sliderTamanho = document.querySelector("#slider-tamanho");
const valorTamanho = document.querySelector("#valor-tamanho");

const diminuirTamanho = document.querySelector("#diminuir-tamanho");
const aumentarTamanho = document.querySelector("#aumentar-tamanho");

const botaoGerar = document.querySelector("#botao-gerar");
const botaoCopiar = document.querySelector("#botao-copiar");

const textoCopiar = document.querySelector("#texto-copiar");
const iconeCopiar = document.querySelector("#icone-copiar");

const contadorCaracteres = document.querySelector("#contador-caracteres");

const textoForca = document.querySelector("#texto-forca");
const segmentosForca = document.querySelectorAll(".barra-segmento");

const valorEntropia = document.querySelector("#valor-entropia");
const tempoQuebra = document.querySelector("#tempo-quebra");

const checkboxes = document.querySelectorAll(".checkbox");

const maiusculo = document.querySelector("#maiusculo");
const minusculo = document.querySelector("#minusculo");
const numero = document.querySelector("#numero");
const simbolo = document.querySelector("#simbolo");

const caracteres = {
    maiusculas: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    minusculas: "abcdefghijklmnopqrstuvwxyz",
    numeros: "0123456789",
    simbolos: "!@#$%^&*()-_=+[]{};:,.<>/?"
};

function numeroAleatorio(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);

    return array[0] % max;
}

function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = numeroAleatorio(i + 1);

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function obterGruposSelecionados() {
    const grupos = [];

    if (maiusculo.checked) {
        grupos.push(caracteres.maiusculas);
    }

    if (minusculo.checked) {
        grupos.push(caracteres.minusculas);
    }

    if (numero.checked) {
        grupos.push(caracteres.numeros);
    }

    if (simbolo.checked) {
        grupos.push(caracteres.simbolos);
    }

    return grupos;
}

function atualizarTamanho() {
    valorTamanho.textContent = sliderTamanho.value;

    sliderTamanho.style.background =
        `linear-gradient(to right, #e52b40 ${
            ((sliderTamanho.value - sliderTamanho.min) /
            (sliderTamanho.max - sliderTamanho.min)) * 100
        }%, #392729 0%)`;

    gerarSenha();
}

function gerarSenha() {
    const tamanho = Number(sliderTamanho.value);
    const grupos = obterGruposSelecionados();

    if (grupos.length === 0) {
        campoSenha.value = "";
        textoForca.textContent = "SELECIONE CARACTERES";
        textoForca.style.color = "#ff5365";

        contadorCaracteres.textContent = "0 CARACTERES";
        valorEntropia.textContent = "0 bits";
        tempoQuebra.textContent = "—";

        segmentosForca.forEach(segmento => {
            segmento.style.background = "#33282a";
        });

        return;
    }

    const conjunto = grupos.join("");

    let senha = [];

    grupos.forEach(grupo => {
        senha.push(grupo[numeroAleatorio(grupo.length)]);
    });

    while (senha.length < tamanho) {
        senha.push(conjunto[numeroAleatorio(conjunto.length)]);
    }

    senha = embaralhar(senha);

    campoSenha.value = senha.join("");

    contadorCaracteres.textContent =
        `${senha.length} CARACTERES`;

    calcularSeguranca(tamanho, conjunto.length);
}

function calcularSeguranca(tamanho, quantidadeCaracteres) {
    const entropia = tamanho * Math.log2(quantidadeCaracteres);

    valorEntropia.textContent = `${entropia.toFixed(1)} bits`;

    let nivel;
    let cor;
    let quantidadeSegmentos;

    if (entropia <= 35) {
        nivel = "FRACA";
        cor = "#ff5365";
        quantidadeSegmentos = 1;
    } else if (entropia <= 57) {
        nivel = "MÉDIA";
        cor = "#f0a43b";
        quantidadeSegmentos = 2;
    } else {
        nivel = "FORTE";
        cor = "#40d99b";
        quantidadeSegmentos = 4;
    }

    textoForca.textContent = nivel;
    textoForca.style.color = cor;

    segmentosForca.forEach((segmento, indice) => {
        segmento.style.background =
            indice < quantidadeSegmentos
                ? cor
                : "#33282a";
    });

    calcularTempo(entropia);
}

function calcularTempo(entropia) {
    const tentativasPorSegundo = 1e10;

    const tentativas = Math.pow(2, entropia);
    const segundos = tentativas / tentativasPorSegundo;

    if (segundos < 1) {
        tempoQuebra.textContent = "Instantâneo";
    } else if (segundos < 60) {
        tempoQuebra.textContent = `${Math.ceil(segundos)} segundos`;
    } else if (segundos < 3600) {
        tempoQuebra.textContent = `${Math.ceil(segundos / 60)} minutos`;
    } else if (segundos < 86400) {
        tempoQuebra.textContent = `${Math.ceil(segundos / 3600)} horas`;
    } else if (segundos < 31536000) {
        tempoQuebra.textContent = `${Math.ceil(segundos / 86400)} dias`;
    } else if (segundos < 31536000 * 1000) {
        tempoQuebra.textContent =
            `${Math.ceil(segundos / 31536000)} anos`;
    } else {
        tempoQuebra.textContent = "Milhares de anos";
    }
}

diminuirTamanho.addEventListener("click", () => {
    if (sliderTamanho.value > 1) {
        sliderTamanho.value--;
        atualizarTamanho();
    }
});

aumentarTamanho.addEventListener("click", () => {
    if (sliderTamanho.value < 20) {
        sliderTamanho.value++;
        atualizarTamanho();
    }
});

sliderTamanho.addEventListener("input", atualizarTamanho);

checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", gerarSenha);
});
istener("click", gerarSenha);

botaoCopiar.addEventListener("click", async () => {
    if (!campoSenha.value) {
        return;
    }

    try {
        await navigator.clipboard.writeText(campoSenha.value);

        textoCopiar.textContent = "COPIADO!";
        iconeCopiar.textContent = "✓";

        botaoCopiar.style.borderColor = "#40d99b";
        botaoCopiar.style.color = "#40d99b";

        setTimeout(() => {
            textoCopiar.textContent = "COPIAR";
            iconeCopiar.textContent = "▣";

            botaoCopiar.style.borderColor = "";
            botaoCopiar.style.color = "";
        }, 1800);

    } catch (erro) {
        campoSenha.select();
        document.execCommand("copy");

        textoCopiar.textContent = "COPIADO!";

        setTimeout(() => {
            textoCopiar.textContent = "COPIAR";
        }, 1800);
    }
});

atualizarTamanho();