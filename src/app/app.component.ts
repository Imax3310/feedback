import { RouterOutlet } from '@angular/router';
import { NgFor, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgFor, CommonModule, HttpClientModule, FormsModule, AppComponent, RecaptchaModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'feedback';
  name: string = '';
  phone: string = '';
  email: string = '';
  topicId: number = 0;
  topics: any[] = []; 
  message: string = '';
  feedbackMessage: string = '';
  feedbackSent: boolean = false;
  isEmailValid: boolean = true;
  emailTouched: boolean = false;
  showResultForm: boolean = false;
  captchaToken: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  recapthcaService = inject(ReCaptchaV3Service);
  executeRecaptcha(token: any) {
    this.captchaToken = token;
    console.log(token);
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
        topicId: this.topicId,
        message: this.message
      }).subscribe(
        (response) => {
          console.log('Feedback sent successfully:', response);
          this.feedbackSent = true;
  
          this.http.get<any>('/api/getFeedback').subscribe(
            (feedbackResponse) => {
              const feedback = feedbackResponse[0];
              const contactName = feedback.contact_name;
              const contactPhone = feedback.contact_phone;
              const contactEmail = feedback.contact_email;
              const topicName = feedback.topic_name;
              const message = feedback.message;
  
              this.feedbackMessage = `Введенное сообщение:
              Имя: ${contactName}
              Телефон: ${contactPhone}
              Email: ${contactEmail}
              Тема: ${topicName}
              Сообщение: ${message}`;
  
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
