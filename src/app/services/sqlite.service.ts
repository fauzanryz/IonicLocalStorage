import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CapacitorSQLite,
  capConnectionOptions,
} from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root',
})
export class SQLiteService {
  //private db: any;
  db = CapacitorSQLite;

  // jika menggunakan physical device, silahkan menggunakan tethering
  // lalu cek ip address dari laptop/pc yang digunakan
  // untuk windows, gunakan perintah ipconfig
  // untuk linux, gunakan perintah ifconfig
  private apiUrl = 'http://172.22.2.47/todo/api.php';
  // jika menggunakan emulator, silahkan menggunakan localhost
  // private apiUrl = 'http://latihan.local/todo/api.php'; //pastikan url sesuai dengan komputer anda
  // bisa saja menggunakan ip komputer dan dalam wifi yang sama
  // atau anda bisa menggunakan free hosting
  constructor(private http: HttpClient) {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    const dbOptions: capConnectionOptions = {
      database: 'my-database',
      encrypted: false,
      mode: 'no-encryption',
      readonly: false,
    };

    // Use this.db as a reference to CapacitorSQLite for executing queries
    this.db = CapacitorSQLite;
    this.db.createConnection(dbOptions);
    this.db.open({ database: 'my-database', readonly: false });

    await this.createTable();
  }

  private async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS todo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_name TEXT NOT NULL,
        completed INTEGER DEFAULT 0
      )`;

    // Use CapacitorSQLite for running queries
    await this.db.run({
      database: 'my-database',
      statement: query,
      values: [],
    });
  }

  async addTodo(taskName: string): Promise<void> {
    const query = 'INSERT INTO todo (task_name) VALUES (?)';
    await this.db.run({
      database: 'my-database',
      statement: query,
      values: [taskName],
    });
  }

  async getTodos(): Promise<any[]> {
    const query = 'SELECT * FROM todo';
    const result = await this.db.query({
      database: 'my-database',
      statement: query,
      values: [],
    });
    return result?.values || [];
  }

  async updateTodoStatus(id: number, completed: number): Promise<void> {
    const query = 'UPDATE todo SET completed = ? WHERE id = ?';
    await this.db.run({
      database: 'my-database',
      statement: query,
      values: [completed, id],
    });
  }

  async deleteTodo(id: number): Promise<void> {
    const query = 'DELETE FROM todo WHERE id = ?';
    await this.db.run({
      database: 'my-database',
      statement: query,
      values: [id],
    });
  }

  async clearTodos(): Promise<void> {
    const query = 'DELETE FROM todo';
    await this.db.run({
      database: 'my-database',
      statement: query,
      values: [],
    });
  }

  async addTodoAndSync(taskName: string): Promise<void> {
    await this.addTodo(taskName); // Add to local SQLite database
    await this.syncTodos(); // Sync with the remote API
  }

  private async syncTodos(): Promise<void> {
    const todos = await this.getTodos(); // Get all local todos

    // Send each todo to the API

    for (const todo of todos) {
      this.http.post(this.apiUrl, { task_name: todo.task_name }).subscribe(
        () => {
          // Handle success, e.g., mark the todo as synced
          console.log('Todo synced successfully');
        },
        (error) => {
          console.error('Error syncing todo:', error);
        }
      );
    }
  }
}
