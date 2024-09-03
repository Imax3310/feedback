import { RouterOutlet } from '@angular/router';
import { NgFor, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgFor, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'feedback';
  name: string = '';
  phone: string = '';
  email: string = '';
  topic: string = '';
  message: string = '';
  feedbackMessage: string = '';
  feedbackSent: boolean = false;
  isEmailValid: boolean = true;
  emailTouched: boolean = false;
  showResultForm: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  checkEmailValidity(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
      this.isEmailValid = EMAIL_REGEXP.test(input.value);
      this.emailTouched = true;
    }
  }

  sendFeedback(): void {
    if (this.isEmailValid) {
      this.http.post<any>('/api/sendFeedback', {
        name: this.name,
        phone: this.phone,
        email: this.email,
        topic: this.topic,
        message: this.message
      }).subscribe(
        (response) => {
          console.log('Feedback sent successfully:', response);
          this.feedbackSent = true;

          this.http.get<any>('/api/getFeedback').subscribe(
            (feedbackResponse) => {
              this.feedbackMessage = `Введенное сообщение
              Имя: ${feedbackResponse[0].name}
              Телефон: ${feedbackResponse[0].phone}
              Email: ${feedbackResponse[0].email}
              Тема: ${feedbackResponse[0].topic}
              Сообщение: ${feedbackResponse[0].message}`;
              this.showResultForm = true;
            },
            (error) => {
              console.error('Error fetching feedback:', error);
            }
          );
        },
        (error) => {
          console.error('Error:', error);
        }
      );
    }
  }

  closeResultForm(): void {
    this.showResultForm = false;
  }
}
