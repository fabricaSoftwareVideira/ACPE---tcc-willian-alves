import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import CryptoJS from "crypto-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Função para calcular o hash do conteúdo de um arquivo PDF.
 * @param file - O arquivo PDF do qual o hash será calculado.
 * @returns Uma Promise que resolve para o hash do arquivo PDF.
 */
export const calculatePdfHash = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Quando o arquivo for lido, calcula o hash
    reader.onload = (e) => {
      const fileContent = e.target?.result;

      if (fileContent) {
        // Converte o conteúdo do arquivo para uma palavra do CryptoJS
        const wordArray = CryptoJS.lib.WordArray.create(fileContent as ArrayBuffer);
        
        // Calcula o hash SHA-256 (pode-se usar MD5 ou outro algoritmo também)
        const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
        
        // Resolve a Promise com o hash calculado
        resolve(hash);
      } else {
        reject('Falha ao ler o conteúdo do arquivo.');
      }
    };

    // Lê o arquivo como array buffer (para binário)
    reader.readAsArrayBuffer(file);
  });
};

export const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    
    for (let i = 0; i < 20; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        autoId += chars[randomIndex];
    }

    return autoId;
}

export const getRandomFileName = () => {
  var timestamp = new Date().toISOString().replace(/[-:.]/g,"");  
  var random = ("" + Math.random()).substring(2, 8); 
  var random_number = timestamp+random;  
  return random_number;
  }