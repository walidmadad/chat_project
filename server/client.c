#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <pthread.h>

#define PORT 2525

int sock;
char username[50]; // Stocke le nom du client

// Fonction pour écouter les messages en arrière-plan
void *receive_messages(void *arg)
{
    char message[1024];
    while (1)
    {
        memset(message, 0, sizeof(message));
        int bytes_received = recv(sock, message, sizeof(message), 0);
        if (bytes_received <= 0)
        {
            printf("Déconnecté du serveur.\n");
            close(sock);
            exit(0);
        }
        printf("\n%s\n", message); // Affiche directement le message formaté du serveur
    }
}

int main()
{
    struct sockaddr_in server_addr;
    char message[1024];

    sock = socket(AF_INET, SOCK_STREAM, 0);
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    server_addr.sin_addr.s_addr = inet_addr("127.0.0.1");

    if (connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
    {
        perror("Connexion échouée");
        return 1;
    }

    printf("Connecté au serveur !\n");

    // Demander un nom d'utilisateur
    printf("Entrez votre nom : ");
    fgets(username, sizeof(username), stdin);
    username[strcspn(username, "\n")] = 0; // Supprime le \n

    // Envoyer le nom au serveur en premier
    send(sock, username, strlen(username), 0);

    // Lancer un thread pour écouter les messages entrants
    pthread_t recv_thread;
    pthread_create(&recv_thread, NULL, receive_messages, NULL);
    pthread_detach(recv_thread);

    // Envoyer des messages en boucle
    while (1)
    {
        printf("Vous : ");
        fgets(message, sizeof(message), stdin);
        message[strcspn(message, "\n")] = 0; // Supprime le \n

        char formatted_message[2048]; // 50 (nom) + 1024 (msg) max
        snprintf(formatted_message, sizeof(formatted_message), "%s: %s", username, message);

        send(sock, formatted_message, strlen(formatted_message), 0);
    }

    return 0;
}
