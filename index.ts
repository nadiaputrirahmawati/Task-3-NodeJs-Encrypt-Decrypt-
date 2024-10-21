import { promises as fs } from 'fs';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import * as readline from 'readline';
import * as path from 'path';

const algorithm = 'aes-256-cbc';

// Fungsi Encrypt
const Encrypt = async (file: string, pw: string) => {
    try {
        const data = await fs.readFile(file);
        const key = scryptSync(pw, 'salt', 32);
        const iv = randomBytes(16);
        const cipher = createCipheriv(algorithm, key, iv); 
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

        const encryptedFilePath = `${file}_encrypted`;
        await fs.writeFile(encryptedFilePath, Buffer.concat([iv, encrypted]));

        const fileName = path.basename(encryptedFilePath);
        console.log(`File ${file} telah terenkripsi menjadi ${fileName}`);
    } catch (error) {
        console.error(`Gagal mengenkripsi file: ${error.message}`);
    }
};

// Fungsi Decrypt
const Decrypt = async (file: string, pw: string) => {
    try {
        const data = await fs.readFile(file);
        const key = scryptSync(pw, 'salt', 32);
        const iv = data.slice(0, 16);
        const encryptedText = data.slice(16);
        const decipher = createDecipheriv(algorithm, key, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        
        const decryptedFilePath = file.replace('_encrypted', '');
        await fs.writeFile(decryptedFilePath, decrypted);
        console.log(`File ${file} telah didekripsi menjadi ${decryptedFilePath}`);
    } catch (error) {
        console.error(`Gagal mendekripsi file: ${error.message}`);
    }
};

// Fungsi Input
const Input = async (fileInput: string): Promise<string> => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(fileInput, answer => { rl.close(); resolve(answer); }));
};

// Fungsi utama untuk menjalankan program
async function main() {
    try {
        const command = await Input('Masukkan perintah (encrypt/decrypt): ');
        const filePath = await Input('Masukkan jalur file: ');
        const password = await Input('Masukkan kata sandi: ');

        if (command === 'encrypt') {
            await Encrypt(filePath, password);
        } else if (command === 'decrypt') {
            await Decrypt(filePath, password);
        } else {
            console.error('Perintah tidak dikenal. Gunakan "encrypt" atau "decrypt".');
        }
    } catch (error) {
        console.error(`Terjadi kesalahan: ${error.message}`);
    }
}

main().catch(console.error);
