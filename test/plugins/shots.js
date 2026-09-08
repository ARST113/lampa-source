(function () {
    'use strict';

    function init$7() {
      Lampa.Lang.add({
        empty: {
          ru: '',
          en: '',
          uk: '',
          be: '',
          zh: '',
          pt: '',
          bg: '',
          ro: ''
        }
      });
      Lampa.Lang.add({
        shots_modal_before_recording_txt_1: {
          ru: 'Сохраняйте свои любимые моменты и делитесь ими с другими!',
          en: 'Save your favorite moments and share them with others!',
          uk: 'Зберігайте свої улюблені моменти та діліться ними з іншими!',
          be: 'Захоўвайце свае любімыя моманты і дзяліцеся імі з іншымі!',
          zh: '保存您喜爱的时刻并与他人分享！',
          pt: 'Salve seus momentos favoritos e compartilhe-os com outras pessoas!',
          bg: 'Запазвайте любимите си моменти и ги споделяйте с други!',
          ro: 'Salvează-ți momentele preferate și împărtășește-le cu ceilalți!'
        },
        shots_modal_before_recording_txt_2: {
          ru: 'Выберите интересующий момент в видео и нажмите кнопку "Начать запись".',
          en: 'Choose the moment of interest in the video and press the "Start Recording" button.',
          uk: 'Виберіть цікавий момент у відео та натисніть кнопку "Почати запис".',
          be: 'Выберыце цікавы момант у відэа і націсніце кнопку "Пачаць запіс".',
          zh: '选择视频中的感兴趣时刻，然后按“开始录制”按钮。',
          pt: 'Escolha o momento de interesse no vídeo e pressione o botão "Iniciar Gravação".',
          bg: 'Изберете интересния момент във видеото и натиснете бутона "Започни запис".',
          ro: 'Alegeți momentul de interes din videoclip și apăsați butonul "Începeți înregistrarea".'
        },
        shots_step: {
          ru: 'Шаг',
          en: 'Step',
          uk: 'Крок',
          be: 'Крок',
          zh: '步骤',
          pt: 'Passo',
          bg: 'Стъпка',
          ro: 'Pas'
        },
        shots_start_recording: {
          ru: 'Начать запись',
          en: 'Start recording',
          uk: 'Почати запис',
          be: 'Пачаць запіс',
          zh: '开始录制',
          pt: 'Iniciar gravação',
          bg: 'Започни запис',
          ro: 'Începe înregistrarea'
        },
        shots_choice_start_point: {
          ru: 'Выбрать позицию',
          en: 'Choose position',
          uk: 'Вибрати позицію',
          be: 'Выбраць пазіцыю',
          zh: '选择位置',
          pt: 'Escolher posição',
          bg: 'Изберете позиция',
          ro: 'Alegeți poziția'
        },
        shots_modal_button_upload_start: {
          ru: 'Загрузить и сохранить запись',
          en: 'Upload and save recording',
          uk: 'Завантажити та зберегти запис',
          be: 'Загрузіць і захаваць запіс',
          zh: '上传并保存录音',
          pt: 'Carregar e salvar gravação',
          bg: 'Качи и запази записа',
          ro: 'Încărcați și salvați înregistrarea'
        },
        shots_modal_button_upload_cancel: {
          ru: 'Отменить и удалить запись',
          en: 'Cancel and delete recording',
          uk: 'Скасувати та видалити запис',
          be: 'Адмяніць і видаліць запіс',
          zh: '取消并删除录音',
          pt: 'Cancelar e excluir gravação',
          bg: 'Отмени и изтрий записа',
          ro: 'Anulează și șterge înregistrarea'
        },
        shots_modal_button_upload_again: {
          ru: 'Не удалось загрузить. Попробовать снова',
          en: 'Failed to upload. Try again',
          uk: 'Не вдалося завантажити. Спробуйте ще раз',
          be: 'Не ўдалося загрузіць. Паспрабуйце яшчэ раз',
          zh: '上传失败。 再试一次',
          pt: 'Falha ao carregar. Tente novamente',
          bg: 'Неуспешен ъплоуд. Опитай отново',
          ro: 'Încărcarea a eșuat. Încearcă din nou'
        },
        shots_modal_button_upload_complete: {
          ru: 'Хорошо',
          en: 'Done',
          uk: 'Готово',
          be: 'Гатова',
          zh: '完成',
          pt: 'Concluído',
          bg: 'Готово',
          ro: 'Finalizat'
        },
        shots_modal_short_recording_txt: {
          ru: 'Запись слишком короткая. Минимальная длина записи должна быть не менее 10 секунд.',
          en: 'The recording is too short. The minimum recording length must be at least 10 seconds.',
          uk: 'Запис занадто короткий. Мінімальна довжина запису повинна бути не менше 10 секунд.',
          be: 'Запіс занадта кароткі. Мінімальная даўжыня запісу павінна быць не менш за 10 секунд.',
          zh: '录音时间太短。 最短录音长度必须至少为10秒。',
          pt: 'A gravação é muito curta. O comprimento mínimo da gravação deve ser de pelo menos 10 segundos.',
          bg: 'Записът е твърде кратък. Минималната дължина на записа трябва да бъде поне 10 секунди.',
          ro: 'Înregistrarea este prea scurtă. Lungimea minimă a înregistrării trebuie să fie de cel puțin 10 secunde.'
        },
        shots_upload_progress_start: {
          ru: 'Получение ссылки для загрузки...',
          en: 'Getting upload link...',
          uk: 'Отримання посилання для завантаження...',
          be: 'Атрыманне спасылкі для загрузкі...',
          zh: '获取上传链接...',
          pt: 'Obtendo link de upload...',
          bg: 'Получаване на връзка за качване...',
          ro: 'Se obține link-ul de upload...'
        },
        shots_upload_progress_uploading: {
          ru: 'Загрузка записи...',
          en: 'Uploading recording...',
          uk: 'Завантаження запису...',
          be: 'Загрузка запісу...',
          zh: '正在上传录音...',
          pt: 'Carregando gravação...',
          bg: 'Качване на записа...',
          ro: 'Se încarcă înregistrarea...'
        },
        shots_upload_progress_notify: {
          ru: 'Оповещение сервиса...',
          en: 'Notifying service...',
          uk: 'Повідомлення сервісу...',
          be: 'Апавяшчэнне сэрвісу...',
          zh: '通知服务...',
          pt: 'Notificando serviço...',
          bg: 'Уведомяване на услугата...',
          ro: 'Se notifică serviciul...'
        },
        shots_upload_complete_text: {
          ru: 'Запись успешно загружена и отправлена на обработку. Вы получите уведомление, когда она будет готова.',
          en: 'The recording has been successfully uploaded and sent for processing. You will receive a notification when it is ready.',
          uk: 'Запис успішно завантажено та надіслано на обробку. Ви отримаєте повідомлення, коли він буде готовий.',
          be: 'Запіс паспяхова загружаны і адпраўлены на апрацоўку. Вы атрымаеце апавяшчэнне, калі ён будзе гатовы.',
          zh: '录音已成功上传并发送以进行处理。 准备好后，您将收到通知。',
          pt: 'A gravação foi carregada com sucesso e enviada para processamento. Você receberá uma notificação quando estiver pronta.',
          bg: 'Записът е успешно качен и изпратен за обработка. Ще получите известие, когато е готов.',
          ro: 'Înregistrarea a fost încărcată cu succes și trimisă spre procesare. Veți primi o notificare când este gata.'
        },
        shots_upload_complete_notify: {
          ru: 'Запись успешно обработана и готова к просмотру!',
          en: 'The recording has been successfully processed and is ready for viewing!',
          uk: 'Запис успішно оброблено і готовий до перегляду!',
          be: 'Запіс паспяхова апрацаваны і гатовы да прагляду!',
          zh: '录音已成功处理，可以观看！',
          pt: 'A gravação foi processada com sucesso e está pronta para visualização!',
          bg: 'Записът е успешно обработен и готов за гледане!',
          ro: 'Înregistrarea a fost procesată cu succes și este gata pentru vizionare!'
        },
        shots_upload_error_notify: {
          ru: 'Не удалось обработать запись.',
          en: 'Failed to process the recording.',
          uk: 'Не вдалося обробити запис.',
          be: 'Не ўдалося апрацаваць запіс.',
          zh: '无法处理录音。',
          pt: 'Falha ao processar a gravação.',
          bg: 'Неуспешна обработка на записа.',
          ro: 'Procesarea înregistrării a eșuat.'
        },
        shots_upload_notice_text: {
          ru: 'Обратите внимание, что после публикации запись станет доступна для просмотра всем пользователям сервиса.',
          en: 'Please note that after publication, the recording will be available for viewing by all users of the service.',
          uk: 'Зверніть увагу, що після публікації запис стане доступний для перегляду всім користувачам сервісу.',
          be: 'Звярніце ўвагу, што пасля публікації запіс стане даступны для прагляду ўсім карыстальнікам сэрвісу.',
          zh: '请注意，发布后，录音将对所有服务用户可见。',
          pt: 'Observe que, após a publicação, a gravação estará disponível para visualização por todos os usuários do serviço.',
          bg: 'Обърнете внимание, че след публикуването записа ще бъде достъпен за преглед от всички потребители на услугата.',
          ro: 'Rețineți că, după publicare, înregistrarea va fi disponibilă pentru vizionare tuturor utilizatorilor serviciului.'
        },
        shots_title_favorite: {
          ru: 'Сохраненные',
          en: 'Favorites',
          uk: 'Збережені',
          be: 'Захаваныя',
          zh: '收藏夹',
          pt: 'Favoritos',
          bg: 'Любими',
          ro: 'Favorite'
        },
        shots_title_created: {
          ru: 'Созданные',
          en: 'Created',
          uk: 'Створені',
          be: 'Створаныя',
          zh: '已创建',
          pt: 'Criado',
          bg: 'Създадени',
          ro: 'Create'
        },
        shots_title_likes: {
          ru: 'Нравится',
          en: 'Likes',
          uk: 'Подобається',
          be: 'Падабаецца',
          zh: '喜欢',
          pt: 'Curtidas',
          bg: 'Харесвания',
          ro: 'Aprecieri'
        },
        shots_title_saved: {
          ru: 'Сохранено',
          en: 'Saved',
          uk: 'Збережено',
          be: 'Захавана',
          zh: '已保存',
          pt: 'Salvo',
          bg: 'Запазено',
          ro: 'Salvate'
        },
        shots_status_error: {
          ru: 'Ошибка',
          en: 'Error',
          uk: 'Помилка',
          be: 'Памылка',
          zh: '错误',
          pt: 'Erro',
          bg: 'Грешка',
          ro: 'Eroare'
        },
        shots_status_processing: {
          ru: 'Обработка',
          en: 'Processing',
          uk: 'Обробка',
          be: 'Апрацоўка',
          zh: '处理中',
          pt: 'Processando',
          bg: 'Обработка',
          ro: 'Se procesează'
        },
        shots_status_ready: {
          ru: 'Загружено',
          en: 'Ready',
          uk: 'Завантажено',
          be: 'Загружана',
          zh: '已就绪',
          pt: 'Carregado',
          bg: 'Качено',
          ro: 'Gata'
        },
        shots_status_blocked: {
          ru: 'Заблокировано',
          en: 'Blocked',
          uk: 'Заблоковано',
          be: 'Заблакіравана',
          zh: '已封锁',
          pt: 'Bloqueado',
          bg: 'Блокирано',
          ro: 'Blocat'
        },
        shots_status_deleted: {
          ru: 'Удалено',
          en: 'Deleted',
          uk: 'Видалено',
          be: 'Выдалена',
          zh: '已删除',
          pt: 'Excluído',
          bg: 'Изтрито',
          ro: 'Șters'
        },
        shots_modal_error_recording_txt_1: {
          ru: 'Не удалось начать запись.',
          en: 'Failed to start recording.',
          uk: 'Не вдалося почати запис.',
          be: 'Не ўдалося пачаць запіс.',
          zh: '无法开始录制。',
          pt: 'Falha ao iniciar a gravação.',
          bg: 'Неуспешно стартиране на записа.',
          ro: 'Pornirea înregistrării a eșuat.'
        },
        shots_modal_error_recording_txt_2: {
          ru: 'Попробуйте сменить источник видео на другой и повторить попытку.',
          en: 'Try changing the video source to another and try again.',
          uk: 'Спробуйте змінити джерело відео на інше та повторіть спробу.',
          be: 'Паспрабуйце змяніць крыніцу відэа на іншую і паспрабуйце яшчэ раз.',
          zh: '尝试将视频源更改为另一个并重试。',
          pt: 'Tente alterar a fonte de vídeo para outra e tente novamente.',
          bg: 'Опитайте да смените видео източника на друг и опитайте отново.',
          ro: 'Încercați să schimbați sursa video și reîncercați.'
        },
        shots_button_good: {
          ru: 'Хорошо',
          en: 'Done',
          uk: 'Готово',
          be: 'Гатова',
          zh: '完成',
          pt: 'Concluído',
          bg: 'Готово',
          ro: 'Gata'
        },
        shots_button_report: {
          ru: 'Подать жалобу',
          en: 'Report',
          uk: 'Поскаржитися',
          be: 'Паскардзіцца',
          zh: '举报',
          pt: 'Denunciar',
          bg: 'Докладвай',
          ro: 'Raportează'
        },
        shots_button_delete_video: {
          ru: 'Удалить запись',
          en: 'Delete recording',
          uk: 'Видалити запис',
          be: 'Видаліць запіс',
          zh: '删除录音',
          pt: 'Excluir gravação',
          bg: 'Изтрий записа',
          ro: 'Șterge înregistrarea'
        },
        shots_modal_report_txt_1: {
          ru: 'Вы уверены, что хотите подать жалобу на это video?',
          en: 'Are you sure you want to report this video?',
          uk: 'Ви впевнені, що хочете подати скаргу на це відео?',
          be: 'Вы ўпэўненыя, што хочаце паскардзіцца на гэта відэа?',
          zh: '您确定要举报此视频吗？',
          pt: 'Tem certeza de que deseja denunciar este vídeo?',
          bg: 'Сигурни ли сте, че искате да докладвате това видео?',
          ro: 'Sigur doriți să raportați acest videoclip?'
        },
        shots_modal_report_txt_2: {
          ru: 'Видео имеет нецензурное содержание, насилие или другие неприемлемые материалы.',
          en: 'The video contains obscene content, violence, or other unacceptable materials.',
          uk: 'Відео містить непристойний контент, насильство або інші неприйнятні матеріали.',
          be: 'Відэа змяшчае непрыстойны кантэнт, гвалт або іншыя непрымальныя матэрыялы.',
          zh: '该视频包含淫秽内容、暴力或其他不可接受的材料。',
          pt: 'O vídeo contém conteúdo obsceno, violência ou outros materiais inaceitáveis.',
          bg: 'Видеото съдържа непристойно съдържание, насилие или други неприемливи материали.',
          ro: 'Videoclipul conține limbaj obscen, violență sau alte materiale inacceptabile.'
        },
        shots_modal_report_txt_3: {
          ru: 'После подачи жалобы данное видео получит штрафные баллы. При накоплении определенного количества штрафных баллов видео будет удалено.',
          en: 'After reporting, this video will receive penalty points. Upon accumulating a certain number of penalty points, the video will be deleted.',
          uk: 'Після подання скарги це відео отримає штрафні бали. При накопиченні певної кількості штрафних балів відео буде видалено.',
          be: 'Пасля падачы скаргі гэта відэа атрымае штрафныя балы. Пры назапашванні пэўнай колькасці штрафных балаў відэа будзе выдалена.',
          zh: '举报后，该视频将获得处罚分数。 累积一定数量的处罚分数后，视频将被删除。',
          pt: 'Após a denúncia, este vídeo receberá pontos de penalidade. Ao acumular um certo número de pontos de penalidade, o vídeo será excluído.',
          bg: 'След докладването това видео ще получи наказателни точки. При натрупване на определен брой наказателни точки видеото ще бъде изтрито.',
          ro: 'După raportare, acest videoclip va primi puncte de penalizare. La acumularea unui anumit număr de puncte, videoclipul va fi șters.'
        },
        shots_modal_report_bell: {
          ru: 'Жалоба отправлена',
          en: 'Report submitted',
          uk: 'Скарга надіслана',
          be: 'Скарга адпраўлена',
          zh: '举报已提交',
          pt: 'Denúncia enviada',
          bg: 'Докладът е изпратен',
          ro: 'Raportul a fost trimis'
        },
        shots_modal_report_bell_alreadyed: {
          ru: 'Вы уже подавали жалобу на это видео',
          en: 'You have already reported this video',
          uk: 'Ви вже подавали скаргу на це відео',
          be: 'Вы ўжо падавалі скаргу на гэта відэа',
          zh: '您已举报此视频',
          pt: 'Você já denunciou este vídeo',
          bg: 'Вече сте докладвали това видео',
          ro: 'Ați raportat deja acest videoclip'
        },
        shots_modal_deleted_bell: {
          ru: 'Запись успешно удалена',
          en: 'Recording successfully deleted',
          uk: 'Запис успішно видалено',
          be: 'Запіс паспяхова выдалены',
          zh: '录音已成功删除',
          pt: 'Gravação excluída com sucesso',
          bg: 'Записът е успешно изтрит',
          ro: 'Înregistrarea a fost ștearsă cu succes'
        },
        shots_modal_delete_txt_1: {
          ru: 'Вы уверены, что хотите удалить эту запись?',
          en: 'Are you sure you want to delete this recording?',
          uk: 'Ви впевнені, що хочете видалити цей запис?',
          be: 'Вы ўпэўненыя, што хочаце выдаліць гэты запіс?',
          zh: '您确定要删除此录音吗？',
          pt: 'Tem certeza de que deseja excluir esta gravação?',
          bg: 'Сигурни ли сте, че искате да изтриете този запис?',
          ro: 'Sigur doriți să ștergeți această înregistrare?'
        },
        shots_modal_delete_txt_2: {
          ru: 'Запись будет удалена навсегда и не сможет быть восстановлена.',
          en: 'The recording will be permanently deleted and cannot be recovered.',
          uk: 'Запис буде назавжди видалено і не може бути відновлено.',
          be: 'Запіс будзе назаўжды выдалены і не можа быць адноўлены.',
          zh: '录音将被永久删除，无法恢复。',
          pt: 'A gravação será excluída permanentemente e não poderá ser recuperada.',
          bg: 'Записът ще бъде изтрит завинаги и не може да бъде възстановен.',
          ro: 'Înregistrarea va fi ștearsă definitiv și nu poate fi recuperată.'
        },
        shots_modal_quota_txt_1: {
          ru: 'Не торопитесь записывать новый момент!',
          en: 'Don\'t rush to record a new moment!',
          uk: 'Не поспішайте записувати новий момент!',
          be: 'Не спяшайцеся запісваць новы момант!',
          zh: '不要急于记录新时刻！',
          pt: 'Não se apresse para gravar um novo momento!',
          bg: 'Не бързайте да записвате нов момент!',
          ro: 'Nu vă grăbiți să înregistrați un moment nou!'
        },
        shots_modal_quota_txt_2: {
          ru: 'Действуются ограничения на частоту записи, чтобы избежать перегрузки сервиса. Вам нужно подождать еще {time}',
          en: 'There are restrictions on the frequency of recording to avoid overloading the service. You need to wait another {time}',
          uk: 'Існують обмеження на частоту запису, щоб уникнути перевантаження сервісу. Вам потрібно почекати ще {time}',
          be: 'Існуюць абмежаванні на частату запісу, каб пазбегнуць перагрузкі сэрвісу. Вам трэба пачакаць яшчэ {time}',
          zh: '对录音频率有一定限制，以避免服务过载。 您需要再等 {time}',
          pt: 'Existem restrições na frequência de gravação para evitar sobrecarregar o serviço. Você precisa esperar mais {time}',
          bg: 'Има ограничения за честотата на запис, за да се избегне претоварване на услугата. Трябва да изчакате още {time}',
          ro: 'Există restricții privind frecvența înregistrărilor. Trebuie să mai așteptați {time}'
        },
        shots_modal_before_upload_recording_txt_1: {
          ru: 'Будьте ориганальны!',
          en: 'Be original!',
          uk: 'Будьте оригінальними!',
          be: 'Будзьце арыгінальнымі!',
          zh: '要有创意！',
          pt: 'Seja original!',
          bg: 'Бъдете оригинални!',
          ro: 'Fii original!'
        },
        shots_modal_before_upload_recording_txt_2: {
          ru: 'Похоже, вы записали "титры" в начале или в конце фильма. Если это так, то пожалуйста, выберите другой фрагмент видео для записи.',
          en: 'It looks like you recorded the "credits" at the beginning or end of the movie. If so, please choose another video fragment to record.',
          uk: 'Схоже, ви записали "титри" на початку або в кінці фільму. Якщо так, будь ласка, виберіть інший фрагмент відео для запису.',
          be: 'Падаецца, вы запісалі "трэйлер" на пачатку або ў канцы фільма. Калі так, калі ласка, выберыце іншы фрагмент відэа для запісу.',
          zh: '看起来您在电影的开头或结尾录制了“片尾字幕”。 如果是这样，请选择另一个视频片段进行录制。',
          pt: 'Parece que você gravou os "créditos" no início ou no final do filme. Se for esse o caso, escolha outro fragmento de vídeo para gravar.',
          bg: 'Изглежда сте записали "титрите" в началото или в края на филма. Ако е така, моля изберете друг фрагмент от видеото за запис.',
          ro: 'Se pare că ați înregistrat „creditele” la începutul sau sfârșitul filmului. Dacă da, vă rugăm să alegeți un alt fragment video pentru înregistrare.'
        },
        shots_button_choice_fragment: {
          ru: 'Выбрать другой фрагмент',
          en: 'Choose another fragment',
          uk: 'Вибрати інший фрагмент',
          be: 'Выбраць іншы фрагмент',
          zh: '选择另一个片段',
          pt: 'Escolher outro fragmento',
          bg: 'Избери друг фрагмент',
          ro: 'Alege un alt fragment'
        },
        shots_button_continue_upload: {
          ru: 'Продолжить загрузку',
          en: 'Continue uploading',
          uk: 'Продовжити завантаження',
          be: 'Працягнуць загрузку',
          zh: '继续上传',
          pt: 'Continuar enviando',
          bg: 'Продължи качването',
          ro: 'Continuați încărcarea'
        },
        shots_recording_text: {
          ru: 'Идет запись',
          en: 'Recording in progress',
          uk: 'Йде запис',
          be: 'Ідзе запіс',
          zh: '正在录制',
          pt: 'Gravação em andamento',
          bg: 'Записът е в ход',
          ro: 'Înregistrare în curs'
        },
        shots_watch: {
          ru: 'Смотреть нарезки',
          en: 'Watch shots',
          uk: 'Дивитися нарізки',
          be: 'Глядзець нарэзкі',
          zh: '观看片段',
          pt: 'Assistir trechos',
          bg: 'Гледайте нарязки',
          ro: 'Vizionează clipuri'
        },
        shots_down: {
          ru: 'Нажми вниз',
          en: 'Press down',
          uk: 'Натисни вниз',
          be: 'Націсні ўніз',
          zh: '按下',
          pt: 'Pressione para baixo',
          bg: 'Натисни надолу',
          ro: 'Apasă jos'
        },
        shots_how_create_video_title: {
          ru: 'Как создать видео',
          en: 'How to create a video',
          uk: 'Як створити відео',
          be: 'Як стварыць відэа',
          zh: '如何创建视频',
          pt: 'Como criar um vídeo',
          bg: 'Как да създадете видео',
          ro: 'Cum să creezi un videoclip'
        },
        shots_how_create_video_subtitle: {
          ru: 'Посмотреть инструкцию по созданию видео',
          en: 'View instructions for creating a video',
          uk: 'Переглянути інструкцію зі створення відео',
          be: 'Паглядзець інструкцію па стварэнні відэа',
          zh: '查看创建视频的说明',
          pt: 'Ver instrucciones para criar um vídeo',
          bg: 'Вижте инструкциите за създаване на видео',
          ro: 'Vezi instrucțiunile pentru crearea unui videoclip'
        },
        shots_card_empty_descr: {
          ru: 'Здесь пока нет шотов, но вы можете создать первый!',
          en: 'There are no shots here yet, but you can create the first one!',
          uk: 'Тут поки немає шотів, але ви можете створити перший!',
          be: 'Тут пакуль няма шотаў, але вы можете стварыць першы!',
          zh: '这里还没有镜头，但您可以创建第一个！',
          pt: 'Ainda não há trechos aqui, mas você pode criar o primeiro!',
          bg: 'Тук все още няма нарязки, но можете да създадете първия!',
          ro: 'Nu există clipuri aici, dar poți să-l creezi pe primul!'
        },
        shots_alert_noshots: {
          ru: 'Шотов пока нет',
          en: 'No shots yet',
          uk: 'Шотів поки немає',
          be: 'Шотаў пакуль няма',
          zh: '还没有镜头',
          pt: 'Ainda não há trechos',
          bg: 'Все още няма нарязки',
          ro: 'Niciun clip încă'
        },
        shots_choice_tags: {
          ru: 'Вы можете выбрать теги:',
          en: 'You can choose tags:',
          uk: 'Ви можете вибрати теги:',
          be: 'Вы можаце выбраць тэгаў:',
          zh: '您可以选择标签：',
          pt: 'Você pode escolher tags:',
          bg: 'Можете да изберете тагове:',
          ro: 'Puteți alege etichete:'
        },
        shots_tag_action: {
          ru: 'Экшен',
          en: 'Action',
          uk: 'Екшен',
          be: 'Экшн',
          zh: '动作',
          pt: 'Ação',
          bg: 'Екшън',
          ro: 'Acțiune'
        },
        shots_tag_comedy: {
          ru: 'Юмор',
          en: 'Humor',
          uk: 'Гумор',
          be: 'Гумар',
          zh: '幽默',
          pt: 'Humor',
          bg: 'Хумор',
          ro: 'Umor'
        },
        shots_tag_drama: {
          ru: 'Драма',
          en: 'Drama',
          uk: 'Драма',
          be: 'Драма',
          zh: '戏剧',
          pt: 'Drama',
          bg: 'Драма',
          ro: 'Dramă'
        },
        shots_tag_horror: {
          ru: 'Ужасы',
          en: 'Horror',
          uk: 'Ужаси',
          be: 'Ужасы',
          zh: '恐怖',
          pt: 'Horror',
          bg: 'Ужас',
          ro: 'Groază'
        },
        shots_tag_thriller: {
          ru: 'Триллер',
          en: 'Thriller',
          uk: 'Трилер',
          be: 'Трылер',
          zh: '惊悚',
          pt: 'Thriller',
          bg: 'Трилър',
          ro: 'Thriller'
        },
        shots_tag_anime: {
          ru: 'Аниме',
          en: 'Anime',
          uk: 'Аніме',
          be: 'Анімэ',
          zh: '动漫',
          pt: 'Anime',
          bg: 'Аниме',
          ro: 'Anime'
        },
        shots_tag_fantasy: {
          ru: 'Фэнтези',
          en: 'Fantasy',
          uk: 'Фентезі',
          be: 'Фэнтэзі',
          zh: '奇幻',
          pt: 'Fantasia',
          bg: 'Фентъзи',
          ro: 'Fantezie'
        },
        shots_tag_sci_fi: {
          ru: 'Фантастика',
          en: 'Sci-Fi',
          uk: 'Фантастика',
          be: 'Фантастыка',
          zh: '科幻',
          pt: 'Ficção Científica',
          bg: 'Фантастика',
          ro: 'Ficțiune Științifică'
        },
        shots_settings_in_player: {
          ru: 'Показывать моменты в плеере',
          en: 'Show moments in player',
          uk: 'Показувати моменти в плеєрі',
          be: 'Паказваць моманты ў плееры',
          zh: '在播放器中显示镜头',
          pt: 'Mostrar momentos no player',
          bg: 'Показване на моменти в плейъра',
          ro: 'Afișați momentele în player'
        },
        shots_settings_in_card: {
          ru: 'Показывать кнопку Shots в карточках',
          en: 'Show Shots button in cards',
          uk: 'Показувати кнопку Shots в картках',
          be: 'Паказваць кнопку Shots у картках',
          zh: '在卡片中显示 Shots 按钮',
          pt: 'Mostrar botão Shots em cartões',
          bg: 'Показване на бутон Shots в картите',
          ro: 'Afișați butonul Shots în carduri'
        },
        shots_watch_roll: {
          ru: 'Смотреть ленту',
          en: 'Watch roll',
          uk: 'Дивитися стрічку',
          be: 'Глядзець стужку',
          zh: '观看卷',
          pt: 'Assistir rolo',
          bg: 'Гледайте ролка',
          ro: 'Vizionați ruloul'
        },
        shots_choose_tags_select: {
          ru: 'Или выберите теги',
          en: 'Or choose tags',
          uk: 'Або виберіть теги',
          be: 'Або выберите теги',
          zh: '或者选择标签',
          pt: 'Ou escolha tags',
          bg: 'Или выберите теги',
          ro: 'Sau alegeți etichete'
        },
        shots_watch_tags: {
          ru: 'Смотреть по тегам',
          en: 'Watch by tags',
          uk: 'Дивитися за тегами',
          be: 'Глядзець па тэгах',
          zh: '按标签观看',
          pt: 'Assistir por tags',
          bg: 'Гледайте по тагове',
          ro: 'Vizionați după etichete'
        },
        shots_alert_no_tags: {
          ru: 'Выберите хотя бы один тег',
          en: 'Please select at least one tag',
          uk: 'Будь ласка, виберіть хоча б один тег',
          be: 'Калі ласка, выберыце хаця б адзін тэг',
          zh: '请至少选择一个标签',
          pt: 'Por favor, selecione pelo menos uma tag',
          bg: 'Моля, изберете поне един таг',
          ro: 'Vă rugăm să selectați cel puțin un eticheta'
        },
        shots_player_recorder_rewind_text: {
          ru: 'Перемотать назад',
          en: 'Rewind',
          uk: 'Перемотати назад',
          be: 'Пераматаць назад',
          zh: '倒带',
          pt: 'Rebobinar',
          bg: 'Върни назад',
          ro: 'Derulați înapoi'
        },
        shots_player_recorder_forward_text: {
          ru: 'Перемотать вперед',
          en: 'Fast forward',
          uk: 'Перемотати вперед',
          be: 'Пераматаць наперад',
          zh: '快进',
          pt: 'Avançar',
          bg: 'Напред',
          ro: 'Derulați înainte'
        },
        shots_player_recorder_stop_text: {
          ru: 'Остановить запись',
          en: 'Stop recording',
          uk: 'Зупинити запис',
          be: 'Спыніць запіс',
          zh: '停止录制',
          pt: 'Parar gravação',
          bg: 'Спиране на записа',
          ro: 'Opriți înregistrarea'
        }
      });
    }
    var Lang = {
      init: init$7
    };

    function init$6() {
      Lampa.Template.add('shots_player_record_button', "\n        <div class=\"button selector shots-player-button\" data-controller=\"player_panel\">\n            <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                <circle cx=\"11.718\" cy=\"11.718\" r=\"10.718\" stroke=\"white\" stroke-width=\"2\"/>\n                <circle cx=\"11.718\" cy=\"11.718\" r=\"5.92621\" fill=\"white\" class=\"rec\"/>\n            </svg>\n        </div>\n    ");
      Lampa.Template.add('shots_modal_before_recording', "\n        <div class=\"about\">\n            <div style=\"font-size: 1.2em;\">\n                #{shots_modal_before_recording_txt_1}\n            </div>\n            <div>\n                <svg class=\"shots-svg-auto shots-svg-auto--helmet\"><use xlink:href=\"#sprite-shots-howneed\"></use></svg>\n            </div>\n            <div>\n                #{shots_modal_before_recording_txt_2}\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_modal_before_upload_recording', "\n        <div class=\"about\">\n            <div style=\"font-size: 1.2em;\">\n                #{shots_modal_before_upload_recording_txt_1}\n            </div>\n            <div>\n                <svg class=\"shots-svg-auto shots-svg-auto--helmet\"><use xlink:href=\"#sprite-shots-notitles\"></use></svg>\n            </div>\n            <div>\n                #{shots_modal_before_upload_recording_txt_2}\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_modal_error_recording', "\n        <div class=\"about\">\n            <div style=\"font-size: 1.2em;\">\n                #{shots_modal_error_recording_txt_1}\n            </div>\n            <div>\n                #{shots_modal_error_recording_txt_2}\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_modal_report', "\n        <div class=\"about\">\n            <div style=\"font-size: 1.2em;\">\n                #{shots_modal_report_txt_1}\n            </div>\n            <div>\n                #{shots_modal_report_txt_2}\n            </div>\n            <div>\n                #{shots_modal_report_txt_3}\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_modal_delete', "\n        <div class=\"about\">\n            <div style=\"font-size: 1.2em;\">\n                #{shots_modal_delete_txt_1}\n            </div>\n            <div>\n                #{shots_modal_delete_txt_2}\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_modal_quota_limit', "\n        <div class=\"about\">\n            <div style=\"font-size: 1.2em;\">\n                #{shots_modal_quota_txt_1}\n            </div>\n            <div>\n                #{shots_modal_quota_txt_2}\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_modal_short_recording', "\n        <div class=\"about\">\n            <div>\n                #{shots_modal_short_recording_txt}\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_player_recorder', "\n        <div class=\"shots-player-recorder\">\n            <div class=\"shots-player-recorder__body\">\n                <div class=\"shots-player-recorder__plate\">\n                    <div class=\"shots-player-recorder__text\">#{shots_recording_text} <span></span></div>\n                    <div class=\"shots-player-recorder__button selector shots-player-recorder__rewind\">\n                        <svg width=\"35\" height=\"24\" viewBox=\"0 0 35 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                            <path d=\"M14.75 10.2302C13.4167 11 13.4167 12.9245 14.75 13.6943L32 23.6536C33.3333 24.4234 35 23.4612 35 21.9216L35 2.00298C35 0.463381 33.3333 -0.498867 32 0.270933L14.75 10.2302Z\" fill=\"currentColor\"/>\n                            <path d=\"M1.75 10.2302C0.416665 11 0.416667 12.9245 1.75 13.6943L19 23.6536C20.3333 24.4234 22 23.4612 22 21.9216L22 2.00298C22 0.463381 20.3333 -0.498867 19 0.270933L1.75 10.2302Z\" fill=\"currentColor\"/>\n                            <rect width=\"6\" height=\"24\" rx=\"2\" transform=\"matrix(-1 0 0 1 6 0)\" fill=\"currentColor\"/>\n                        </svg>\n                        <div>#{shots_player_recorder_rewind_text}</div>\n                    </div>\n                    <div class=\"shots-player-recorder__button selector shots-player-recorder__forward\">\n                        <svg width=\"35\" height=\"24\" viewBox=\"0 0 35 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                            <path d=\"M20.25 10.2302C21.5833 11 21.5833 12.9245 20.25 13.6943L3 23.6536C1.66666 24.4234 -6.72981e-08 23.4612 0 21.9216L8.70669e-07 2.00298C9.37967e-07 0.463381 1.66667 -0.498867 3 0.270933L20.25 10.2302Z\" fill=\"currentColor\"/>\n                            <path d=\"M33.25 10.2302C34.5833 11 34.5833 12.9245 33.25 13.6943L16 23.6536C14.6667 24.4234 13 23.4612 13 21.9216L13 2.00298C13 0.463381 14.6667 -0.498867 16 0.270933L33.25 10.2302Z\" fill=\"currentColor\"/>\n                            <rect x=\"29\" width=\"6\" height=\"24\" rx=\"2\" fill=\"currentColor\"/>\n                        </svg>\n                        <div>#{shots_player_recorder_forward_text}</div>\n                    </div>\n                    <div class=\"shots-player-recorder__button selector shots-player-recorder__stop\">\n                        <svg width=\"19\" height=\"25\" viewBox=\"0 0 19 25\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                            <rect width=\"6\" height=\"25\" rx=\"2\" fill=\"currentColor\"/>\n                            <rect x=\"13\" width=\"6\" height=\"25\" rx=\"2\" fill=\"currentColor\"/>\n                        </svg>\n                        <div>#{shots_player_recorder_stop_text}</div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_modal_upload', "\n        <div class=\"shots-modal-upload\">\n            <div class=\"shots-modal-upload__preview\"></div>\n            <div class=\"shots-modal-upload__body\"></div>\n        </div>\n    ");
      Lampa.Template.add('shots_checkbox', "\n        <div class=\"shots-selector shots-checkbox selector\">\n            <div class=\"shots-checkbox__icon\"></div>\n            <div class=\"shots-checkbox__text\">{text}</div>\n        </div>\n    ");
      Lampa.Template.add('shots_button', "\n        <div class=\"shots-selector shots-button selector\">{text}</div>\n    ");
      Lampa.Template.add('shots_progress', "\n        <div class=\"shots-selector shots-progress selector\">\n            <div class=\"shots-progress__text\">{text}</div>\n            <div class=\"shots-progress__bar\"><div></div></div>\n        </div>\n    ");
      Lampa.Template.add('shots_preview', "\n        <div class=\"shots-preview\">\n            <div class=\"shots-preview__left\">\n                <div class=\"shots-preview__screenshot\">\n                    <img>\n                </div>\n            </div>\n            <div class=\"shots-preview__body\">\n                <div class=\"shots-preview__year\">{year}</div>\n                <div class=\"shots-preview__title\">{title}</div>\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_tags', "\n        <div class=\"shots-tags\"></div>\n    ");
      Lampa.Template.add('shots_upload_complete_text', "\n        <div class=\"about\">\n            <div style=\"padding-bottom: 1em;\">\n                #{shots_upload_complete_text}\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_upload_notice_text', "\n        <div class=\"about\">\n            <div style=\"padding-bottom: 1em;\">\n                #{shots_upload_notice_text}\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_lenta', "\n        <div class=\"shots-lenta\">\n            <div class=\"shots-lenta__video\"></div>\n            <div class=\"shots-lenta__panel\"></div>\n        </div>\n    ");
      Lampa.Template.add('shots_lenta_video', "\n        <div class=\"shots-lenta-video\">\n            <video class=\"shots-lenta-video__video-element\" autoplay loop poster=\"./img/video_poster.png\"></video>\n            <div class=\"shots-lenta-video__progress-bar\">\n                <div></div>\n            </div>\n            <div class=\"player-video__loader shots-lenta-video__loader\"></div>\n            <div class=\"shots-lenta-video__layer\"></div>\n        </div>\n    ");
      Lampa.Template.add('shots_lenta_panel', "\n        <div class=\"shots-lenta-panel\">\n            <div class=\"explorer-card__head shots-lenta-panel__card loading\">\n                <div class=\"explorer-card__head-left\">\n                    <div class=\"explorer-card__head-img selector shots-lenta-panel__card-img\">\n                        <img>\n                    </div>\n                </div>\n                <div class=\"explorer-card__head-body selector\">\n                    <div class=\"shots-lenta-panel__info\">\n                        <div class=\"explorer-card__head-create shots-lenta-panel__card-year\"></div>\n                        <div class=\"shots-lenta-panel__card-title\"></div>\n                        <div class=\"shots-lenta-panel__recorder hide\"></div>\n                        <div class=\"shots-lenta-panel__tags\"></div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"shots-lenta-panel__right\">\n                <div class=\"shots-lenta-panel__author\"></div>\n\n                <div class=\"shots-lenta-panel__buttons\">\n                    <div class=\"selector action-liked\">\n                        <svg width=\"39\" height=\"35\" viewBox=\"0 0 39 35\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                            <path d=\"M26.6504 1.50977C29.2617 1.38597 32.2036 2.36705 34.7168 5.42676C37.1567 8.39737 37.1576 11.3625 36.2148 14.002C35.2408 16.7288 33.2538 19.0705 31.834 20.4238C31.8295 20.4281 31.8247 20.4322 31.8203 20.4365L19.1484 32.8271L6.47754 20.4365C5.03099 18.9847 3.053 16.646 2.08203 13.9443C1.14183 11.3282 1.13938 8.39959 3.58105 5.42676C6.09429 2.36705 9.03613 1.38597 11.6475 1.50977C14.3299 1.63693 16.7044 2.92997 17.9932 4.4873C18.2781 4.83167 18.7024 5.03125 19.1494 5.03125C19.5962 5.03113 20.0198 4.83157 20.3047 4.4873C21.5934 2.92997 23.968 1.63697 26.6504 1.50977Z\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linejoin=\"round\" fill=\"currentColor\" class=\"icon-fill\"/>\n                        </svg>\n                    </div>\n                    <div class=\"selector action-favorite\">\n                        <svg width=\"21\" height=\"32\" viewBox=\"0 0 21 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                            <path d=\"M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z\" stroke=\"currentColor\" stroke-width=\"2.5\" fill=\"currentColor\" class=\"icon-fill\"></path>\n                        </svg>\n                    </div>\n                    <div class=\"selector action-more\">\n                        <svg><use xlink:href=\"#sprite-dots\"></use></svg>\n                    </div>\n                </div>\n            </div>\n        </div>\n    ");
      Lampa.Template.add('shots_counter', "\n        <div class=\"shots-counter\">\n            <span></span>\n            <div></div>\n        </div>\n    ");
      Lampa.Template.add('shots_author', "\n        <div class=\"shots-author\">\n            <div class=\"shots-author__img\">\n                <img>\n            </div>\n            <div class=\"shots-author__name\"></div>\n        </div>\n    ");
      var sprites = "\n        <symbol id=\"sprite-love\" viewBox=\"0 0 39 35\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n            <path d=\"M26.6504 1.50977C29.2617 1.38597 32.2036 2.36705 34.7168 5.42676C37.1567 8.39737 37.1576 11.3625 36.2148 14.002C35.2408 16.7288 33.2538 19.0705 31.834 20.4238C31.8295 20.4281 31.8247 20.4322 31.8203 20.4365L19.1484 32.8271L6.47754 20.4365C5.03099 18.9847 3.053 16.646 2.08203 13.9443C1.14183 11.3282 1.13938 8.39959 3.58105 5.42676C6.09429 2.36705 9.03613 1.38597 11.6475 1.50977C14.3299 1.63693 16.7044 2.92997 17.9932 4.4873C18.2781 4.83167 18.7024 5.03125 19.1494 5.03125C19.5962 5.03113 20.0198 4.83157 20.3047 4.4873C21.5934 2.92997 23.968 1.63697 26.6504 1.50977Z\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linejoin=\"round\"/>\n        </symbol>\n\n        <symbol id=\"sprite-shots\" viewBox=\"0 0 512 512\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n            <path d=\"M253.266 512a19.166 19.166 0 0 1-19.168-19.168V330.607l-135.071-.049a19.164 19.164 0 0 1-16.832-28.32L241.06 10.013a19.167 19.167 0 0 1 36.005 9.154v162.534h135.902a19.167 19.167 0 0 1 16.815 28.363L270.078 502.03a19.173 19.173 0 0 1-16.812 9.97z\" fill=\"currentColor\"></path>\n        </symbol>\n\n        <symbol id=\"sprite-shots-notitles\" viewBox=\"0 0 474 138\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n            <rect x=\"1.5\" y=\"1.5\" width=\"216.196\" height=\"121.309\" rx=\"9.5\" stroke=\"white\" stroke-width=\"3\"/>\n            <rect x=\"255.49\" y=\"1.5\" width=\"216.196\" height=\"121.309\" rx=\"9.5\" stroke=\"white\" stroke-width=\"3\"/>\n            <rect x=\"77.9692\" y=\"49.6289\" width=\"63.2581\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"51.4348\" y=\"64.8156\" width=\"116.327\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"302.813\" y=\"27.8919\" width=\"58.0774\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"345.485\" y=\"10.1938\" width=\"36.2068\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"319.336\" y=\"44.1069\" width=\"41.5542\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"312.751\" y=\"60.3219\" width=\"48.1394\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.66\" x=\"316.25\" y=\"76.5368\" width=\"44.6411\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.38\" x=\"342.385\" y=\"92.7517\" width=\"18.5054\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.28\" x=\"308.429\" y=\"108.967\" width=\"52.4612\" height=\"4.04266\" rx=\"2.02133\" fill=\"white\"/>\n            <rect x=\"371.113\" y=\"27.8919\" width=\"38.2129\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"371.113\" y=\"44.1069\" width=\"47.8267\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"371.113\" y=\"60.3219\" width=\"29.3054\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.66\" x=\"371.113\" y=\"76.5368\" width=\"44.3281\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.38\" x=\"371.113\" y=\"92.7517\" width=\"29.3054\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.28\" x=\"371.113\" y=\"108.967\" width=\"30.9517\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"99.001\" y=\"80.0025\" width=\"21.1946\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"169.168\" y=\"88.6869\" width=\"62.5064\" height=\"6.28762\" rx=\"3.14381\" transform=\"rotate(45 169.168 88.6869)\" fill=\"#FF3F3F\"/>\n            <rect width=\"62.5064\" height=\"6.28762\" rx=\"3.14381\" transform=\"matrix(-0.707107 0.707107 0.707107 0.707107 208.921 88.6869)\" fill=\"#FF3F3F\"/>\n            <rect x=\"423.386\" y=\"88.6869\" width=\"62.5064\" height=\"6.28762\" rx=\"3.14381\" transform=\"rotate(45 423.386 88.6869)\" fill=\"#FF3F3F\"/>\n            <rect width=\"62.5064\" height=\"6.28762\" rx=\"3.14381\" transform=\"matrix(-0.707107 0.707107 0.707107 0.707107 463.138 88.6869)\" fill=\"#FF3F3F\"/>\n        </symbol>\n\n        <symbol id=\"sprite-shots-howneed\" viewBox=\"0 0 474 138\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n            <rect x=\"1.5\" y=\"1.5\" width=\"216.196\" height=\"121.309\" rx=\"9.5\" stroke=\"white\" stroke-width=\"3\"/>\n            <rect x=\"255.49\" y=\"1.5\" width=\"216.196\" height=\"121.309\" rx=\"9.5\" stroke=\"white\" stroke-width=\"3\"/>\n            <rect x=\"54.1262\" y=\"103.818\" width=\"47.7241\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.28\" x=\"16.4497\" y=\"103.818\" width=\"186.409\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"302.813\" y=\"27.8919\" width=\"58.0774\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"345.485\" y=\"10.1938\" width=\"36.2068\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"319.336\" y=\"44.1069\" width=\"41.5542\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"312.751\" y=\"60.3219\" width=\"48.1394\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.66\" x=\"316.25\" y=\"76.5368\" width=\"44.6411\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.38\" x=\"342.385\" y=\"92.7517\" width=\"18.5054\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.28\" x=\"308.429\" y=\"108.967\" width=\"52.4612\" height=\"4.04266\" rx=\"2.02133\" fill=\"white\"/>\n            <rect x=\"371.113\" y=\"27.8919\" width=\"38.2129\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"371.113\" y=\"44.1069\" width=\"47.8267\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"371.113\" y=\"60.3219\" width=\"29.3054\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.66\" x=\"371.113\" y=\"76.5368\" width=\"44.3281\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect opacity=\"0.28\" x=\"371.113\" y=\"108.967\" width=\"30.9517\" height=\"5.14891\" rx=\"2.57446\" fill=\"white\"/>\n            <rect x=\"59.2751\" y=\"100.74\" width=\"11.3044\" height=\"5.14891\" rx=\"2.57446\" transform=\"rotate(90 59.2751 100.74)\" fill=\"white\"/>\n            <rect x=\"101.85\" y=\"100.74\" width=\"11.3044\" height=\"5.14891\" rx=\"2.57446\" transform=\"rotate(90 101.85 100.74)\" fill=\"white\"/>\n            <rect x=\"423.386\" y=\"88.6869\" width=\"62.5064\" height=\"6.28762\" rx=\"3.14381\" transform=\"rotate(45 423.386 88.6869)\" fill=\"#FF3F3F\"/>\n            <rect width=\"62.5064\" height=\"6.28762\" rx=\"3.14381\" transform=\"matrix(-0.707107 0.707107 0.707107 0.707107 463.138 88.6869)\" fill=\"#FF3F3F\"/>\n        </symbol>\n    ";
      document.querySelector('#sprites').innerHTML += sprites;
    }
    var Templates = {
      init: init$6
    };

    function videoScreenShot(video) {
      var screen_width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 320;
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var scale = screen_width / video.videoWidth;
      var width = Math.round(video.videoWidth * scale);
      var height = Math.round(video.videoHeight * scale);
      canvas.width = width;
      canvas.height = height;
      try {
        context.drawImage(video, 0, 0, width, height);
      } catch (e) {
        console.error('Shots', 'video screenshot error:', e.message);
      }
      return canvas.toDataURL('image/png');
    }
    function videoReplaceStatus(from, to) {
      to.status = from.status;
      to.screen = from.screen;
      to.file = from.file;
    }
    function getBalanser(card) {
      var history_data = Lampa.Storage.get('online_watched_last', '{}');
      var history_key = Lampa.Utils.hash(card.name ? card.original_name : card.original_title);
      var history_item = history_data[history_key];
      return history_item && history_item.balanser ? history_item.balanser : '';
    }
    function shortVoice(voice) {
      return (voice || '').replace(/\s[^a-zA-Zа-яА-Я0-9].*$/, '').trim();
    }
    function isTSQuality(str) {
      return str.toLowerCase().indexOf(' ts') > -1 || str.toLowerCase().indexOf(' ad') > -1;
    }
    function modal(html, buttons, back) {
      var body = $('<div></div>');
      var footer = $('<div class="shots-modal-footer"></div>');
      body.append(html);
      body.append(footer);
      buttons.forEach(function (button) {
        var btn = Lampa.Template.get('shots_button', {
          text: button.name
        });
        btn.on('hover:enter', function () {
          if (button.onSelect) button.onSelect();
        });
        if (button.cancel) btn.addClass('shots-selector--transparent');
        footer.append(btn);
      });
      Lampa.Modal.open({
        html: body,
        size: 'small',
        scroll: {
          nopadding: true
        },
        onBack: back
      });
    }
    var Utils = {
      videoScreenShot: videoScreenShot,
      videoReplaceStatus: videoReplaceStatus,
      getBalanser: getBalanser,
      shortVoice: shortVoice,
      isTSQuality: isTSQuality,
      modal: modal
    };

    var Defined = {
      quota_next_record: 1000 * 60 * 10,
      // 10 минут
      video_size: 1280,
      screen_size: 500,
      recorder_max_duration: 60 * 5,
      // 5 минут
      cdn: 'https://cdn.cub.rip/shots/'
    };

    function counter(method, v1, v2, v3) {
      $.ajax({
        dataType: 'json',
        url: Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/metric/stat?method=' + method + '&value_one=' + (v1 || '') + '&value_two=' + (v2 || '') + '&value_three=' + (v3 || '')
      });
    }
    var Metric = {
      counter: counter
    };

    function Recorder(video) {
      this.html = Lampa.Template.get('shots_player_recorder');
      var start_point = video.currentTime;
      this.start = function () {
        Metric.counter('shots_recorder_start');
        try {
          this.screenshot = Utils.videoScreenShot(video, Defined.screen_size);
          this.run();
        } catch (e) {
          console.error('Recorder', e.message);
          this.error(e);
        }
      };
      this.run = function () {
        var _this = this;
        $('body').append(this.html);
        var button_stop = this.html.find('.shots-player-recorder__stop');
        var button_forward = this.html.find('.shots-player-recorder__forward');
        var button_rewind = this.html.find('.shots-player-recorder__rewind');
        button_stop.on('hover:enter', this.stop.bind(this));
        button_forward.on('hover:enter', function () {
          if (video.currentTime < start_point + Defined.recorder_max_duration) {
            video.currentTime += 5;
            _this.tik();
          }
        });
        button_rewind.on('hover:enter', function () {
          if (video.currentTime - 10 > start_point) {
            video.currentTime -= 5;
            _this.tik();
          }
        });
        Lampa.Controller.add('recorder', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(_this.html);
            Lampa.Controller.collectionFocus(button_stop, _this.html);
          },
          left: function left() {
            Navigator.move('left');
          },
          right: function right() {
            Navigator.move('right');
          },
          back: this.stop.bind(this)
        });
        Lampa.Controller.toggle('recorder');
        this.interval = setInterval(this.tik.bind(this), 1000);
        this.tik();
        this.onRun();
      };
      this.tik = function () {
        var seconds = Math.round(video.currentTime - start_point);
        var progress = Lampa.Utils.secondsToTime(seconds).split(':');
        progress = progress[1] + ':' + progress[2];
        this.html.find('.shots-player-recorder__text span').text(progress + ' / ' + Lampa.Utils.secondsToTimeHuman(Defined.recorder_max_duration));
        if (seconds >= Defined.recorder_max_duration) this.stop();
      };
      this.error = function (e) {
        this.destroy();
        this.onError(e);
        Metric.counter('shots_recorder_error');
      };
      this.stop = function () {
        var elapsed = video.currentTime - start_point;
        if (elapsed < 1) {
          this.error(new Error('Stoped too early, maybe codecs not supported'));
        } else {
          this.destroy();
          this.onStop({
            duration: Math.round(elapsed),
            screenshot: this.screenshot,
            start_point: Math.round(start_point),
            end_point: Math.round(video.currentTime)
          });
          Metric.counter('shots_recorder_end');
        }
      };
      this.destroy = function () {
        clearInterval(this.interval);
        this.html.remove();
      };
    }

    function Tags$1() {
      var tags_data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      this.html = Lampa.Template.get('shots_tags');
      this.create = function () {
        if (tags_data) this.update(tags_data);
      };
      this.update = function (data) {
        var tags = [];
        this.html.empty();
        data.season && tags.push('S-' + data.season);
        data.episode && tags.push('E-' + data.episode);
        var voice = Utils.shortVoice(data.voice_name);
        if (data.voice_name && voice !== data.card_title) tags.push(voice);
        this.html.append(tags.map(function (tag) {
          return '<div>' + tag + '</div>';
        }).join(''));
      };
      this.render = function () {
        return this.html;
      };
      this.destroy = function () {
        this.html.remove();
      };
    }

    function Preview(data) {
      this.data = data;
      this.html = Lampa.Template.get('shots_preview');
      this.create = function () {
        if (this.data.recording.screenshot) {
          this.html.find('.shots-preview__screenshot img').css({
            opacity: 1
          }).eq(0)[0].src = this.data.recording.screenshot;
        }
        var release_date = this.data.play_data.card.release_date || this.data.play_data.card.first_air_date || '';
        var year = release_date.slice(0, 4);
        this.html.find('.shots-preview__year').html(year || '----');
        this.html.find('.shots-preview__title').html(this.data.play_data.card.name || this.data.play_data.card.title || '');
        this.tags = new Tags$1(this.data.play_data);
        this.tags.create();
        this.html.find('.shots-preview__body').append(this.tags.render());
      };
      this.render = function () {
        return this.html;
      };
      this.destroy = function () {
        this.html.remove();
      };
    }

    function Checkbox() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.html = Lampa.Template.get('shots_checkbox');
      this.state = params.state || false;
      this.create = function () {
        var _this = this;
        this.setText(params.text || '');
        this.setState(this.state);
        this.html.on('hover:enter', function () {
          _this.setState(!_this.state);
        });
      };
      this.setText = function (text) {
        this.html.find('.shots-checkbox__text').html(text);
      };
      this.setState = function (state) {
        this.state = state;
        this.html.toggleClass('shots-checkbox--checked', state);
      };
      this.render = function () {
        return this.html;
      };
      this.destroy = function () {
        this.html.remove();
      };
    }

    function url(u) {
      //return 'http://localhost:3100/api/shots/' + u
      return Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/api/shots/' + u;
    }
    function params() {
      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 15000;
      if (!Lampa.Account.Permit.account.token) return {
        timeout: timeout
      };
      return {
        headers: {
          token: Lampa.Account.Permit.account.token,
          profile: Lampa.Account.Permit.account.profile.id
        },
        timeout: timeout
      };
    }
    function uploadRequest(data, onsuccess, onerror) {
      Lampa.Network.silent(url('upload-request'), onsuccess, onerror, data, params());
    }
    function uploadStatus(id, onsuccess, onerror) {
      Lampa.Network.silent(url('upload-status/' + id), onsuccess, onerror, null, params(5000));
    }
    function shotsVideo(id, onsuccess, onerror) {
      Lampa.Network.silent(url('video/' + id), onsuccess, onerror, null, params(5000));
    }
    function shotsList(type) {
      var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var onsuccess = arguments.length > 2 ? arguments[2] : undefined;
      var onerror = arguments.length > 3 ? arguments[3] : undefined;
      Lampa.Network.silent(url('list/' + type + '?page=' + page), onsuccess, onerror, null, params(5000));
    }
    function shotsCard(card) {
      var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var onsuccess = arguments.length > 2 ? arguments[2] : undefined;
      var onerror = arguments.length > 3 ? arguments[3] : undefined;
      Lampa.Network.silent(url('card/' + card.id + '/' + (card.original_name ? 'tv' : 'movie') + '?page=' + page), onsuccess, onerror, null, params(5000));
    }
    function shotsChannel(id) {
      var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var onsuccess = arguments.length > 2 ? arguments[2] : undefined;
      var onerror = arguments.length > 3 ? arguments[3] : undefined;
      Lampa.Network.silent(url('channel/' + id + '?page=' + page), onsuccess, onerror, null, params(10000));
    }
    function shotsLiked(id, type, onsuccess, onerror) {
      var uid = Lampa.Storage.get('lampa_uid', '');
      Lampa.Network.silent(url('liked?uid=' + uid), onsuccess, onerror, {
        id: id,
        type: type
      }, params(5000));
    }
    function shotsBlock(id, onsuccess, onerror) {
      Lampa.Network.silent(url('block'), onsuccess, onerror, {
        id: id
      }, params());
    }
    function shotsReport$1(id, onsuccess, onerror) {
      Lampa.Network.silent(url('report'), onsuccess, onerror, {
        id: id
      }, params());
    }
    function shotsDelete$1(id, onsuccess, onerror) {
      Lampa.Network.silent(url('delete'), onsuccess, onerror, {
        id: id
      }, params());
    }
    function shotsFavorite(action, shot, onsuccess, onerror) {
      Lampa.Network.silent(url('favorite'), onsuccess, onerror, {
        sid: shot.id,
        card_title: shot.card_title,
        card_poster: shot.card_poster,
        action: action
      }, params(5000));
    }
    function lenta() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var onsuccess = arguments.length > 1 ? arguments[1] : undefined;
      var uid = Lampa.Storage.get('lampa_uid', '');
      Lampa.Arrays.extend(query, {
        page: 1,
        sort: 'id',
        uid: uid,
        limit: 20
      });
      var path = [];
      for (var key in query) {
        path.push(key + '=' + encodeURIComponent(query[key]));
      }
      Lampa.Network.silent(url('lenta?' + path.join('&')), function (result) {
        onsuccess(result.results);
      }, function () {
        onsuccess([]);
      }, null, params(10000));
    }
    function shotsViewed(id, onsuccess, onerror) {
      var uid = Lampa.Storage.get('lampa_uid', '');
      Lampa.Network.silent(url('viewed?uid=' + uid), onsuccess, onerror, {
        id: id
      }, params(5000));
    }
    var Api = {
      uploadRequest: uploadRequest,
      uploadStatus: uploadStatus,
      shotsList: shotsList,
      shotsLiked: shotsLiked,
      shotsFavorite: shotsFavorite,
      shotsVideo: shotsVideo,
      shotsBlock: shotsBlock,
      shotsReport: shotsReport$1,
      shotsDelete: shotsDelete$1,
      shotsCard: shotsCard,
      shotsChannel: shotsChannel,
      shotsViewed: shotsViewed,
      lenta: lenta
    };

    function Progress() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.html = Lampa.Template.get('shots_progress');
      this.text = params.text || '';
      this.create = function () {
        this.setText(this.text);
        this.setProgress(0);
        this.setState('waiting');
      };
      this.setText = function (text) {
        this.text = text;
        this.html.find('.shots-progress__text').text(this.text);
      };
      this.setProgress = function (percent) {
        this.html.find('.shots-progress__bar div').css('width', percent + '%');
      };
      this.setState = function (state) {
        this.html.removeClass('state--waiting state--uploading state--done');
        this.html.addClass('state--' + state);
      };
      this.render = function () {
        return this.html;
      };
      this.destroy = function () {
        this.html.remove();
      };
    }

    function _defineProperty(e, r, t) {
      return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }) : e[r] = t, e;
    }
    function ownKeys(e, r) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function (r) {
          return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread2(e) {
      for (var r = 1; r < arguments.length; r++) {
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
          _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
      }
      return e;
    }
    function _toPrimitive(t, r) {
      if ("object" != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r ? String : Number)(t);
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == typeof i ? i : i + "";
    }

    var shots$1 = {};
    function init$5() {
      Lampa.Timer.add(1000 * 60, function () {
        for (var i in shots$1) {
          check(shots$1[i]);
        }
      });
    }
    function check(shot) {
      if (shot.status == 'ready' || shot.status == 'error') return stop(shot);
      Api.uploadStatus(shot.id, function (json) {
        if (json.status == 'ready') {
          Lampa.Bell.push({
            icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
            text: Lampa.Lang.translate('shots_upload_complete_notify')
          });
        }
        if (json.status == 'error') {
          Lampa.Bell.push({
            icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
            text: Lampa.Lang.translate('shots_upload_error_notify')
          });
        }
        if (json.status == 'ready' || json.status == 'error') stop(shot);
        Lampa.Listener.send('shots_status', _objectSpread2({}, json));
      });
    }
    function add$3(shot) {
      if (!shots$1[shot.id]) shots$1[shot.id] = shot;
    }
    function stop(shot) {
      delete shots$1[shot.id];
    }
    var Handler = {
      init: init$5,
      add: add$3,
      stop: stop
    };

    var created = [];
    function init$4() {
      created = Lampa.Storage.get('shots_created', '[]');
      update$1();
      Lampa.Listener.follow('shots_status', updateStatus$1);
      Lampa.Listener.follow('shots_update', updateData$1);
      Lampa.Listener.follow('state:changed', function (e) {
        if (e.target == 'favorite' && (e.reason == 'profile' || e.reason == 'read')) {
          created = [];
          update$1();
        }
      });
      Lampa.Socket.listener.follow('message', function (result) {
        if (result.method == 'update' && result.data.from == 'shots' && result.data.list == 'created') {
          update$1();
        }
      });
    }
    function updateStatus$1(shot) {
      var find = created.find(function (a) {
        return a.id == shot.id;
      });
      if (find) {
        find.status = shot.status;
        find.screen = shot.screen;
        find.file = shot.file;
        Lampa.Storage.set('shots_created', created);
      }
    }
    function updateData$1(shot) {
      var find = created.find(function (a) {
        return a.id == shot.id;
      });
      if (find) {
        find.liked = shot.liked;
        find.saved = shot.saved;
        Lampa.Storage.set('shots_created', created);
      }
    }
    function update$1() {
      Api.shotsList('created', 1, function (shots) {
        created = shots.results;
        Lampa.Storage.set('shots_created', created);
      });
    }
    function add$2(shot) {
      var clone = {};
      Object.assign(clone, shot);
      delete clone.params;
      Lampa.Arrays.insert(created, 0, clone);
      if (created.length > 20) {
        created = created.slice(0, 20);
      }
      Lampa.Storage.set('shots_created', created);
      Lampa.Socket.send('update', {
        params: {
          from: 'shots',
          list: 'created'
        }
      });
    }
    function remove$3(shot) {
      var find_in = created.find(function (a) {
        return a.id == shot.id;
      });
      if (find_in) Lampa.Arrays.remove(created, find_in);
      Lampa.Storage.set('shots_created', created);
      Lampa.Listener.send('shots_status', {
        id: shot.id,
        status: 'deleted',
        file: shot.file,
        screen: shot.screen
      });
      Lampa.Socket.send('update', {
        params: {
          from: 'shots',
          list: 'created'
        }
      });
    }
    function page$1(page, callback) {
      Api.shotsList('created', page, function (shots) {
        callback(shots.results);
      }, function () {
        callback([]);
      });
    }
    function get$2() {
      return Lampa.Arrays.clone(created);
    }
    function find$2(id) {
      return Boolean(created.find(function (a) {
        return a.id == id;
      }));
    }
    var Created = {
      init: init$4,
      remove: remove$3,
      add: add$2,
      get: get$2,
      find: find$2,
      page: page$1
    };

    function Selector(list) {
      this.html = $('<div class="shots-selector-tags"></div>');
      this.list = list || [];
      this.selected = [];
      this.create = function () {
        var _this = this;
        this.list.forEach(function (t) {
          var tag = $('<div class="shots-selector-tags__tag selector"><span>' + t.title + '</span></div>');
          tag.on('hover:enter', function (e) {
            tag.toggleClass('active');
            if (_this.selected.indexOf(t) == -1) {
              _this.selected.push(t);
            } else {
              Lampa.Arrays.remove(_this.selected, t);
            }
          });
          _this.html.append(tag);
        });
      };
      this.get = function () {
        return this.selected;
      };
      this.render = function () {
        return this.html;
      };
      this.destroy = function () {
        this.html.remove();
      };
    }

    var tags = [{
      id: 1,
      slug: 'action'
    }, {
      id: 2,
      slug: 'comedy'
    }, {
      id: 3,
      slug: 'drama'
    }, {
      id: 4,
      slug: 'fantasy'
    }, {
      id: 5,
      slug: 'horror'
    }, {
      id: 6,
      slug: 'thriller'
    }, {
      id: 7,
      slug: 'anime'
    }, {
      id: 8,
      slug: 'sci_fi'
    }];
    function load$1() {
      tags = translate(tags);
    }
    function translate(list) {
      return list.map(function (t) {
        t.title = Lampa.Lang.translate('shots_tag_' + t.slug);
        return t;
      });
    }
    function list() {
      return tags;
    }
    var Tags = {
      load: load$1,
      list: list,
      translate: translate
    };

    function Upload(data) {
      this.data = data;
      this.html = Lampa.Template.get('shots_modal_upload');
      this.start = function () {
        var _this = this;
        this.preview = new Preview(this.data);
        this.checkbox = new Checkbox({
          text: Lampa.Lang.translate('Сделать публичной'),
          state: true
        });
        this.progress = new Progress({
          text: Lampa.Lang.translate('shots_upload_progress_start')
        });
        this.selector_title = $('<div class="shots-line-title">' + Lampa.Lang.translate('shots_choice_tags') + '</div>');
        this.selector = new Selector(Tags.list());
        this.checkbox.create();
        this.preview.create();
        this.progress.create();
        this.progress.render().addClass('hide');
        this.selector.create();
        this.button_upload = Lampa.Template.get('shots_button', {
          text: Lampa.Lang.translate('shots_modal_button_upload_start')
        });
        this.button_cancel = Lampa.Template.get('shots_button', {
          text: Lampa.Lang.translate('shots_modal_button_upload_cancel')
        });
        this.button_again = Lampa.Template.get('shots_button', {
          text: Lampa.Lang.translate('shots_modal_button_upload_again')
        });
        this.button_complete = Lampa.Template.get('shots_button', {
          text: Lampa.Lang.translate('shots_modal_button_upload_complete')
        });
        this.text_complete = Lampa.Template.get('shots_upload_complete_text');
        this.text_notice = Lampa.Template.get('shots_upload_notice_text');
        this.button_again.addClass('hide').on('hover:enter', this.startUpload.bind(this));
        this.button_upload.on('hover:enter', this.startUpload.bind(this));
        this.button_complete.addClass('hide').on('hover:enter', function () {
          _this.destroy();
          _this.onComplete(_this.shot_ready);
        });
        this.text_complete.addClass('hide');
        this.button_cancel.addClass('shots-selector--transparent');
        this.button_cancel.on('hover:enter', this.cancelUpload.bind(this));
        this.html.find('.shots-modal-upload__preview').append(this.preview.render());
        this.html.find('.shots-modal-upload__body').append(this.text_notice).append(this.selector_title).append(this.selector.render()).append(this.button_upload).append(this.progress.render()).append(this.button_again).append(this.button_cancel).append(this.text_complete).append(this.button_complete);
        Lampa.Modal.open({
          html: this.html,
          size: 'small',
          scroll: {
            nopadding: true
          },
          onBack: function onBack() {}
        });
      };
      this.setFocus = function (target) {
        Lampa.Controller.clear();
        Lampa.Controller.collectionSet(this.html);
        Lampa.Controller.collectionFocus(target, this.html);
      };
      this.startUpload = function () {
        this.button_again.addClass('hide');
        this.button_upload.addClass('hide');
        this.progress.render().removeClass('hide');
        this.setFocus(this.progress.render());
        this.progress.setText(Lampa.Lang.translate('shots_upload_progress_start'));
        this.progress.setState('waiting');
        var play = this.data.play_data;
        var card = play.card;
        Api.uploadRequest({
          card_id: card.id,
          card_type: card.original_name ? 'tv' : 'movie',
          card_title: card.title || card.name || card.original_title || card.original_name || 'Unknown',
          card_year: (card.release_date || card.first_air_date || '----').slice(0, 4),
          card_poster: card.poster_path || '',
          start_point: this.data.recording.start_point,
          end_point: this.data.recording.end_point,
          season: play.season || 0,
          episode: play.episode || 0,
          voice_name: play.voice_name || '',
          balanser: play.balanser || '',
          tags: this.selector.get().map(function (t) {
            return t.id;
          }),
          recorder: 'new'
        }, this.endUpload.bind(this), this.errorUpload.bind(this));
      };
      this.errorUpload = function (e) {
        this.progress.render().addClass('hide');
        this.button_again.removeClass('hide');
        this.setFocus(this.button_again);
      };
      this.endUpload = function (upload) {
        this.progress.render().addClass('hide');
        this.button_cancel.addClass('hide');
        this.button_complete.removeClass('hide');
        this.text_complete.removeClass('hide');
        this.text_notice.addClass('hide');
        this.selector_title.remove();
        this.selector.destroy();
        Lampa.Storage.set('shots_last_record', Date.now());
        Api.shotsVideo(upload.id, function (result) {
          Created.add(result.video);
          Handler.add(result.video);
        });
        this.setFocus(this.button_complete);
      };
      this.cancelUpload = function () {
        if (this.uploading) this.uploading.abort();
        this.destroy();
        this.onCancel();
      };
      this.destroy = function () {
        Lampa.Modal.close();
        this.preview.destroy();
        this.checkbox.destroy();
        this.html.remove();
        this.runUpload = function () {};
        this.endUpload = function () {};
        this.cancelUpload = function () {};
        this.notifyUpload = function () {};
      };
    }

    var loaded_shots = {};
    function init$3() {
      var button = "<div class=\"full-start__button shots-view-button selector view--online\" data-subtitle=\"#{shots_watch}\">\n        <svg><use xlink:href=\"#sprite-shots\"></use></svg>\n\n        <span class=\"shots-view-button__title\">Shots</span>\n    </div>";
      Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite' && (Lampa.Storage.field('shots_in_card') || Lampa.Storage.field('shots_in_player'))) {
          var btn = $(Lampa.Lang.translate(button));
          var mov = e.data.movie;
          btn.on('hover:enter', function () {
            Lampa.Activity.push({
              url: '',
              title: 'Shots',
              component: 'shots_card',
              card: mov,
              page: 1
            });
          });
          load(mov, function (shots) {
            if (shots.length) {
              console.log('Shots', 'load for full view:', shots.length, 'items;', 'card id:', mov.id, mov.original_name ? 'tv' : 'movie');
              btn.attr('data-subtitle', Lampa.Lang.translate('shots_watch') + ' <span class="shots-view-button__count">' + (shots.length > 99 ? '99+' : shots.length) + '</span>');
            }
          });
          if (Lampa.Storage.field('shots_in_card')) e.object.activity.render().find('.view--torrent').last().after(btn);
        }
      });
    }
    function load(card, call) {
      var key = card.id + '_' + (card.original_name ? 'tv' : 'movie');
      if (loaded_shots[key]) {
        call(loaded_shots[key]);
      } else {
        Api.shotsCard(card, 1, function (data) {
          loaded_shots[key] = data.results;
          call(data.results);
        });
      }
    }
    function clear() {
      loaded_shots = {};
    }
    function remove$2(card) {
      var key = card.id + '_' + (card.original_name ? 'tv' : 'movie');
      delete loaded_shots[key];
    }
    function get$1(card) {
      var key = card.id + '_' + (card.original_name ? 'tv' : 'movie');
      return loaded_shots[key];
    }
    var View = {
      init: init$3,
      load: load,
      clear: clear,
      remove: remove$2,
      get: get$1
    };

    var button_record = null;
    var play_data = {};
    var player_shots = null;
    function init$2() {
      Lampa.Player.listener.follow('ready', startPlayer);
      Lampa.Player.listener.follow('destroy', stopPlayer);
      button_record = Lampa.Template.get('shots_player_record_button');
      button_record.on('hover:enter', beforeRecording);
      button_record.addClass('hide');
      Lampa.PlayerPanel.render().find('.player-panel__settings').after(button_record);
      Lampa.Controller.listener.follow('toggle', function (e) {
        if (player_shots) player_shots.toggleClass('focus', e.name == 'player_rewind' || Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice());
      });
    }
    function playerPanel(status) {
      Lampa.Player.render().toggleClass('shots-player--recording', !status);
    }
    function startPlayer(data) {
      var _play_data$card;
      play_data = {};
      if (data.card) play_data.card = data.card;else if (Lampa.Activity.active().movie) {
        play_data.card = Lampa.Activity.active().movie;
      }
      var possibly = true;
      var type = (_play_data$card = play_data.card) !== null && _play_data$card !== void 0 && _play_data$card.original_name ? 'tv' : 'movie';
      if (data.iptv || data.youtube) possibly = false;else if (!Lampa.Account.Permit.token) possibly = false;else if (type == 'tv' && (!data.season || !data.episode)) possibly = false;
      if (possibly) {
        play_data.season = data.season || 0;
        play_data.episode = data.episode || 0;
        play_data.voice_name = (data.voice_name || '').trim();
        setTimeout(function () {
          play_data.balanser = Utils.getBalanser(play_data.card || {});
        }, 1000);
        if (play_data.card) {
          var year = parseInt((play_data.card.release_date || play_data.card.first_air_date || '----').slice(0, 4));
          if (type == 'movie') {
            var player_title = Lampa.Player.playdata().title || '';
            play_data.voice_name = (play_data.voice_name || player_title || '').trim();
            if (play_data.voice_name == play_data.card.title || play_data.torrent_hash) play_data.voice_name = '';
          }
          if (!(Utils.isTSQuality(play_data.voice_name) || Utils.isTSQuality(Lampa.Player.playdata().title)) && year >= 1985) button_record.removeClass('hide');
        }
      }
      if (play_data.card && (play_data.card.source == 'tmdb' || play_data.card.source == 'cub')) {
        if (Lampa.Storage.field('shots_in_player')) playerShotsSegments();
      }
    }
    function stopPlayer() {
      button_record.addClass('hide');
      if (player_shots) {
        player_shots.remove();
        player_shots = null;
      }
      playerPanel(true);
      if (play_data.need_tocontent) {
        setTimeout(function () {
          Lampa.Controller.toggle('content');
        }, 100);
      }
    }
    function playerShotsSegments() {
      var type = play_data.card.original_name ? 'tv' : 'movie';
      var video = Lampa.PlayerVideo.video();
      if (type == 'tv' && (!play_data.season || !play_data.episode)) return;
      video.addEventListener('loadeddata', function () {
        View.load(play_data.card, function (shots) {
          if (!Lampa.Player.opened()) return;
          if (type == 'tv' && play_data.season && play_data.episode) {
            shots = shots.filter(function (e) {
              return e.season == play_data.season && e.episode == play_data.episode;
            });
          }
          if (shots.length) {
            player_shots = $('<div class="shots-player-segments"></div>');
            player_shots.toggleClass('focus', Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice());
            shots = shots.filter(function (s) {
              // сортируем по start_point один раз и используем временные поля на массиве
              if (!shots._sorted) {
                shots.sort(function (a, b) {
                  return (Number(a.start_point) || 0) - (Number(b.start_point) || 0);
                });
                shots._sorted = true;
                shots._last_end = -Infinity;
              }
              var start = Number(s.start_point || 0);
              var end = Number(s.end_point || start);

              // если перекрывается с предыдущим включённым — исключаем
              if (start < shots._last_end) return false;

              // обновляем край текущего включённого сегмента
              shots._last_end = Math.max(shots._last_end, end);
              return true;
            });
            shots.forEach(function (elem) {
              var segment = $('<div class="shots-player-segments__time"></div>');
              var picture = $('<div class="shots-player-segments__picture"><img src="' + elem.img + '"></div>');
              var img = picture.find('img')[0];
              img.on('load', function () {
                picture.addClass('shots-player-segments__picture--loaded');
              });
              segment.css({
                left: elem.start_point / video.duration * 100 + '%',
                width: (elem.end_point - elem.start_point) / video.duration * 100 + '%'
              });
              picture.css({
                left: elem.start_point / video.duration * 100 + '%'
              });
              player_shots.append(segment);
              player_shots.append(picture);
              img.src = elem.screen;
              picture.on('click', function () {
                console.log('click shot', elem, elem.start_point);
                Lampa.PlayerVideo.to(elem.start_point);
              });
            });
            Lampa.PlayerPanel.render().find('.player-panel__timeline').before(player_shots);
          }
        });
      });
    }
    function playPlayer() {
      Lampa.PlayerVideo.play();
      Lampa.PlayerPanel.visible(false);
      Lampa.PlayerPanel.hide();
      playerPanel(false);
    }
    function pausePlayer() {
      Lampa.PlayerVideo.pause();
      Lampa.PlayerPanel.visible(false);
      Lampa.PlayerPanel.hide();
      playerPanel(true);
    }
    function closeModal() {
      Lampa.Modal.close();
      Lampa.Controller.toggle('player');
      Lampa.PlayerVideo.pause();
      playerPanel(true);
    }
    function beforeRecording() {
      if (Lampa.Modal.opened()) {
        Lampa.Modal.close();
        play_data.need_tocontent = true;
      }
      pausePlayer();
      var left = Date.now() - Lampa.Storage.get('shots_last_record', '0');
      if (left < Defined.quota_next_record) {
        return Lampa.Modal.open({
          html: Lampa.Template.get('shots_modal_quota_limit', {
            time: Lampa.Utils.secondsToTimeHuman((Defined.quota_next_record - left) / 1000)
          }),
          size: 'small',
          scroll: {
            nopadding: true
          },
          buttons: [{
            name: Lampa.Lang.translate('shots_button_good'),
            onSelect: closeModal
          }],
          onBack: closeModal
        });
      }
      Utils.modal(Lampa.Template.get('shots_modal_before_recording'), [{
        name: Lampa.Lang.translate('shots_start_recording'),
        onSelect: function onSelect() {
          Lampa.Modal.close();
          startRecording();
        }
      }, {
        name: Lampa.Lang.translate('shots_choice_start_point'),
        cancel: true,
        onSelect: function onSelect() {
          Lampa.Modal.close();
          Lampa.Controller.toggle('player_rewind');
          Lampa.PlayerPanel.visible(true);
          playerPanel(true);
        }
      }], closeModal);
    }
    function startRecording() {
      var recorder = new Recorder(Lampa.PlayerVideo.video());
      recorder.onStop = stopRecording;
      recorder.onError = errorRecording;
      recorder.onRun = playPlayer;
      recorder.start();
    }
    function errorRecording(e) {
      Utils.modal(Lampa.Template.get('shots_modal_error_recording'), [{
        name: Lampa.Lang.translate('shots_button_good'),
        onSelect: closeModal
      }], closeModal);
    }
    function stopRecording(recording) {
      pausePlayer();
      if (recording.duration > 10) {
        if (recording.start_point < 60 || recording.end_point > Lampa.PlayerVideo.video().duration - 60 * 5) {
          recording.near_border = true;
          Utils.modal(Lampa.Template.get('shots_modal_before_upload_recording'), [{
            name: Lampa.Lang.translate('shots_button_choice_fragment'),
            onSelect: closeModal
          }, {
            name: Lampa.Lang.translate('shots_button_continue_upload'),
            onSelect: function onSelect() {
              Lampa.Modal.close();
              startUploadRecording(recording);
            }
          }], closeModal);
        } else startUploadRecording(recording);
      } else shortRecording();
    }
    function startUploadRecording(recording) {
      var upload = new Upload({
        recording: recording,
        play_data: play_data
      });
      upload.onCancel = function () {
        Lampa.Controller.toggle('player');
        Lampa.PlayerVideo.pause();
      };
      upload.onComplete = function () {
        Lampa.Controller.toggle('player');
        Lampa.PlayerVideo.pause();
      };
      upload.start();
    }
    function shortRecording() {
      Utils.modal(Lampa.Template.get('shots_modal_short_recording'), [{
        name: Lampa.Lang.translate('shots_button_good'),
        onSelect: closeModal
      }], closeModal);
    }
    var Player = {
      init: init$2
    };

    var shots = {
      favorite: [],
      map: []
    };
    function init$1() {
      shots.favorite = Lampa.Storage.get('shots_favorite', '[]');
      createMap(Lampa.Storage.get('shots_map', '[]'));
      update();
      Lampa.Listener.follow('shots_status', updateStatus);
      Lampa.Listener.follow('shots_update', updateData);
      Lampa.Listener.follow('state:changed', function (e) {
        if (e.target == 'favorite' && (e.reason == 'profile' || e.reason == 'read')) {
          shots.favorite = [];
          createMap([]);
          update();
        }
      });
      Lampa.Socket.listener.follow('message', function (result) {
        if (result.method == 'update' && result.data.from == 'shots' && result.data.list == 'favorite') {
          update();
        }
      });
    }
    function createMap(arr) {
      shots.map = {};
      arr.forEach(function (id) {
        shots.map[id] = 1;
      });
    }
    function updateStatus(shot) {
      if (!shots.map[shot.id]) return;
      var find = shots.favorite.find(function (a) {
        return a.id == shot.id;
      });
      if (find) {
        find.status = shot.status;
        find.screen = shot.screen;
        find.file = shot.file;
        Lampa.Storage.set('shots_favorite', shots.favorite);
      }
    }
    function updateData(shot) {
      if (!shots.map[shot.id]) return;
      var find = shots.favorite.find(function (a) {
        return a.id == shot.id;
      });
      if (find) {
        find.liked = shot.liked;
        find.saved = shot.saved;
        Lampa.Storage.set('shots_favorite', shots.favorite);
      }
    }
    function update() {
      Api.shotsList('favorite', 1, function (shots) {
        shots.favorite = shots.results;
        Lampa.Storage.set('shots_favorite', shots.favorite);
      });
      Api.shotsList('map', 1, function (map) {
        createMap(map.results);
        Lampa.Storage.set('shots_map', map.results);
      });
    }
    function add$1(shot) {
      var clone = {};
      Object.assign(clone, shot);
      delete clone.params;
      Lampa.Arrays.insert(shots.favorite, 0, clone);
      if (shots.favorite.length > 20) {
        shots.favorite = shots.favorite.slice(0, 20);
      }
      shots.map[clone.id] = 1;
      Lampa.Storage.set('shots_favorite', shots.favorite);
      Lampa.Storage.add('shots_map', clone.id);
    }
    function remove$1(shot) {
      var find_in = shots.favorite.find(function (a) {
        return a.id == shot.id;
      });
      if (find_in) Lampa.Arrays.remove(shots.favorite, find_in);
      delete shots.map[shot.id];
      Lampa.Storage.set('shots_favorite', shots.favorite);
      var map = Lampa.Storage.get('shots_map', '[]');
      Lampa.Arrays.remove(map, shot.id);
      Lampa.Storage.set('shots_map', map);
    }
    function page(page, callback) {
      Api.shotsList('favorite', page, function (shots) {
        callback(shots.results);
      }, function () {
        callback([]);
      });
    }
    function get() {
      return Lampa.Arrays.clone(shots.favorite);
    }
    function find$1(shot_id) {
      return Boolean(shots.map[shot_id]);
    }
    function toggle$1(shot, onsuccess, onerror) {
      var finded = find$1(shot.id);
      Api.shotsFavorite(finded ? 'remove' : 'add', shot, function () {
        if (finded) {
          remove$1(shot);
        } else {
          add$1(shot);
        }
        if (onsuccess) onsuccess(finded);
        Lampa.Socket.send('update', {
          params: {
            from: 'shots',
            list: 'favorite'
          }
        });
      }, onerror);
      return !finded;
    }
    var Favorite = {
      init: init$1,
      update: update,
      remove: remove$1,
      add: add$1,
      get: get,
      find: find$1,
      toggle: toggle$1,
      page: page
    };

    var loaded_last = {};
    function start(call) {
      var status = new Lampa.Status(3);
      status.onComplite = function () {
        // Сохраняем последние загруженные шоты для фильтрации релевантных
        loaded_last["new"] = status.data["new"];
        loaded_last.popular = status.data.popular;

        // Фильтруем просмотренные шоты
        status.data["new"] = filterViewed(status.data["new"]);
        status.data.popular = filterViewed(status.data.popular);
        console.log('Shots', 'roll items', 'new', status.data["new"].length, 'popular', status.data.popular.length, 'old', status.data.old.length);

        // Убираем дубли между новыми и популярными и старыми
        status.data.popular = status.data.popular.filter(function (a) {
          return !status.data["new"].find(function (b) {
            return b.id == a.id;
          });
        });
        status.data.old = status.data.old.filter(function (a) {
          return !(status.data["new"].find(function (b) {
            return b.id == a.id;
          }) || status.data.popular.find(function (b) {
            return b.id == a.id;
          }));
        });
        console.log('Shots', 'after filter roll items', 'new', status.data["new"].length, 'popular', status.data.popular.length, 'old', status.data.old.length);

        // Собираем итоговый список
        var items = [].concat(status.data["new"], status.data.popular);

        // Перемешиваем новые и популярные
        items = Lampa.Arrays.shuffle(items);

        // Добавляем метку from_id для старых шотов
        status.data.old.forEach(function (a) {
          return a.from_id = a.id;
        });

        // Добавляем релевантные старые шоты
        items = items.concat(filterViewed(filterRelevant(status.data.old)));
        console.log('Shots', 'relevant roll items', items.length);

        // Если нет шотов, добавляем несколько старых
        if (!items.length) items = status.data.old.slice(-5);
        call(items);
      };
      Api.lenta({
        sort: 'new',
        limit: 50
      }, status.append.bind(status, 'new'));
      Api.lenta({
        sort: 'popular',
        limit: 50
      }, status.append.bind(status, 'popular'));
      Api.lenta({
        sort: 'from_id',
        id: Lampa.Storage.get('shots_lenta_last_id', '0'),
        limit: 50
      }, status.append.bind(status, 'old'));
    }
    function filterRelevant(items) {
      return items.filter(function (a) {
        return !(loaded_last["new"].find(function (b) {
          return b.id == a.id;
        }) || loaded_last.popular.find(function (b) {
          return b.id == a.id;
        }));
      });
    }
    function filterViewed(items) {
      var viewed = Lampa.Storage.cache('shots_viewed', 2000, []);
      var filtred = items.filter(function (a) {
        return viewed.indexOf(a.id) == -1;
      });
      return filtred;
    }
    function next(call) {
      Api.lenta({
        sort: 'from_id',
        id: Lampa.Storage.get('shots_lenta_last_id', '0'),
        limit: 50
      }, function (items) {
        return call(filterRelevant(items));
      });
    }
    function viewedRegister(shot) {
      if (!shot.from_id) Lampa.Storage.add('shots_viewed', shot.id);
      Api.shotsViewed(shot.id);
    }
    function saveFromId(id) {
      Lampa.Storage.set('shots_lenta_last_id', id);
    }
    var Roll = {
      start: start,
      next: next,
      viewedRegister: viewedRegister,
      saveFromId: saveFromId
    };

    function Video() {
      this.html = Lampa.Template.js('shots_lenta_video');
      this.video = this.html.find('video');
      this.progress = this.html.find('.shots-lenta-video__progress-bar div');
      this.layer = this.html.find('.shots-lenta-video__layer');
      this.loader = this.html.find('.shots-lenta-video__loader');
      this.viewed = {};
      this.create = function () {
        var _this = this;
        this.video.addEventListener('timeupdate', function () {
          _this.progress.style.width = _this.video.currentTime / _this.video.duration * 100 + '%';
          if ((_this.video.currentTime / _this.video.duration > 0.1 || _this.video.currentTime > 2) && !_this.viewed[_this.shot.id]) {
            _this.viewed[_this.shot.id] = true;
            Roll.viewedRegister(_this.shot);
          }
          Lampa.Screensaver.resetTimer();
        });
        this.video.addEventListener('waiting', function () {
          _this.showLoading();
        });
        this.video.addEventListener('playing', function () {
          _this.hideLoading();
        });
        this.layer.on('click', function () {
          _this.video.paused ? _this.play() : _this.pause();
        });
        if (Lampa.Platform.is('apple')) this.video.setAttribute('playsinline', 'true');
      };
      this.change = function (shot) {
        this.shot = shot;
        if (shot.from_id) Roll.saveFromId(shot.from_id);
        this.video.setAttribute('poster', shot.img || './img/video_poster.png');
        this.progress.style.width = '0%';
        this.pause();
        this.load();
        this.play();
      };
      this.play = function () {
        var playPromise;
        try {
          playPromise = this.video.play();
        } catch (e) {}
        if (playPromise !== undefined) {
          playPromise.then(function () {
            console.log('Lenta', 'start plaining');
          })["catch"](function (e) {
            console.log('Lenta', 'play promise error:', e.message);
          });
        }
      };
      this.pause = function () {
        var pausePromise;
        try {
          pausePromise = this.video.pause();
        } catch (e) {}
        if (pausePromise !== undefined) {
          pausePromise.then(function () {
            console.log('Lenta', 'pause');
          })["catch"](function (e) {
            console.log('Lenta', 'pause promise error:', e.message);
          });
        }
      };
      this.load = function () {
        this.video.src = '';
        this.video.load();
        this.video.src = this.shot.file;
        this.video.load();
      };
      this.showLoading = function () {
        var _this2 = this;
        this.timer_loading = setTimeout(function () {
          _this2.loader.addClass('show');
        }, 2000);
      };
      this.hideLoading = function () {
        clearTimeout(this.timer_loading);
        this.loader.removeClass('show');
      };
      this.render = function () {
        return this.html;
      };
      this.destroy = function () {
        clearTimeout(this.timer_loading);
        this.html.remove();
        this.viewed = {};
      };
    }

    function Author() {
      var _this = this;
      var author_data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      this.html = Lampa.Template.js('shots_author');
      this.img = this.html.find('img');
      this.box = this.html.find('.shots-author__img');
      this.img.onload = function () {
        _this.box.addClass('loaded');
      };
      this.img.onerror = function () {
        _this.img.src = './img/img_broken.svg';
      };
      this.create = function () {
        if (author_data) this.update(author_data);
      };
      this.update = function (data) {
        this.box.removeClass('loaded');
        var email = data.email;
        var icon = data.icon;
        if (!email) {
          email = Lampa.Account.Permit.account.email;
          icon = Lampa.Account.Permit.account.profile ? Lampa.Account.Permit.account.profile.icon : '';
        }
        this.img.src = Lampa.Utils.protocol() + Lampa.Manifest.cub_domain + '/img/profiles/' + (icon || 'l_1') + '.png';
        this.html.find('.shots-author__name').text(Lampa.Utils.capitalizeFirstLetter((email || 'Unknown').split('@')[0]));
      };
      this.render = function () {
        return this.html;
      };
      this.destroy = function () {
        this.img.onload = null;
        this.img.onerror = null;
        this.html.remove();
      };
    }

    function find(shot_id) {
      return Boolean(Lampa.Storage.get('shots_likes', '[]').find(function (id) {
        return shot_id == id;
      }));
    }
    function add(shot_id) {
      var arr = Lampa.Storage.cache('shots_likes', 100, '[]');
      arr.push(shot_id);
      Lampa.Storage.set('shots_likes', arr);
    }
    function remove(shot_id) {
      var arr = Lampa.Storage.get('shots_likes', '[]');
      Lampa.Arrays.remove(arr, shot_id);
      Lampa.Storage.set('shots_likes', arr);
    }
    function toggle(shot_id, onsuccess, onerror) {
      var finded = find(shot_id);
      Api.shotsLiked(shot_id, finded ? 'unlike' : 'like', function () {
        if (finded) {
          remove(shot_id);
        } else {
          add(shot_id);
        }
        if (onsuccess) onsuccess(finded);
      }, onerror);
      return !finded;
    }
    var Likes = {
      find: find,
      add: add,
      remove: remove,
      toggle: toggle
    };

    function shotsReport(id, callback) {
      Lampa.Modal.open({
        html: Lampa.Template.get('shots_modal_report'),
        size: 'small',
        scroll: {
          nopadding: true
        },
        buttons: [{
          name: Lampa.Lang.translate('shots_button_report'),
          onSelect: function onSelect() {
            Lampa.Modal.close();
            callback && callback();
            var reports = Lampa.Storage.get('shots_reports', '[]');
            if (reports.indexOf(id) == -1) {
              Api.shotsReport(id, function () {
                reports.push(id);
                Lampa.Storage.set('shots_reports', reports);
                Lampa.Bell.push({
                  icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                  text: Lampa.Lang.translate('shots_modal_report_bell')
                });
              });
            } else {
              Lampa.Bell.push({
                icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                text: Lampa.Lang.translate('shots_modal_report_bell_alreadyed')
              });
            }
          }
        }],
        onBack: function onBack() {
          Lampa.Modal.close();
          callback && callback();
        }
      });
    }
    function shotsDelete(id, callback) {
      Lampa.Modal.open({
        html: Lampa.Template.get('shots_modal_delete'),
        size: 'small',
        scroll: {
          nopadding: true
        },
        buttons: [{
          name: Lampa.Lang.translate('shots_button_delete_video'),
          onSelect: function onSelect() {
            Lampa.Modal.close();
            callback && callback();
            var deleted = Lampa.Storage.get('shots_deleted', '[]');
            if (deleted.indexOf(id) == -1) {
              Api.shotsDelete(id, function () {
                deleted.push(id);
                Lampa.Storage.set('shots_deleted', deleted);
                Lampa.Bell.push({
                  icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                  text: Lampa.Lang.translate('shots_modal_deleted_bell')
                });
              });
            } else {
              Lampa.Bell.push({
                icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                text: Lampa.Lang.translate('shots_modal_deleted_bell')
              });
            }
          }
        }],
        onBack: function onBack() {
          Lampa.Modal.close();
          callback && callback();
        }
      });
    }
    var Modals = {
      shotsReport: shotsReport,
      shotsDelete: shotsDelete
    };

    function backward$1() {
      var head = Lampa.Template.get('head_backward', {
        title: ''
      });
      head.find('.head-backward__button').on('click', function () {
        Lampa.Controller.back();
      });
      return head;
    }
    function Slides(params) {
      var html = $("<div class=\"shots-slides\">\n        <div class=\"shots-slides__slides\"></div>\n        <div class=\"shots-slides__install\">".concat(Lampa.Lang.translate(params.button_text), "</div>\n        <div class=\"shots-slides__down\">").concat(Lampa.Lang.translate('shots_down'), "</div>\n    </div>"));
      params.slides.forEach(function (slide_data, slide_index) {
        html.find('.shots-slides__slides').append($("<img class=\"shots-slides__slide slide-".concat(slide_index + 1, "\">")));
      });
      var slide = 0;
      var total = params.slides.length;
      var timeload;
      var cancel = false;
      var down = html.find('.shots-slides__down');
      var install = html.find('.shots-slides__install');
      if (Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice()) {
        html.append(backward$1());
      }
      $('body').append(html);
      var push = function push() {
        if (slide == total) {
          destroy();
          params.onInstall && params.onInstall();
        }
      };
      var next = function next() {
        if (slide >= total) return;
        if (slide > 0) {
          html.find('.slide-' + slide).addClass('up');
        }
        slide++;
        html.find('.slide-' + slide).addClass('active');
        if (slide === total) {
          down.removeClass('active');
          setTimeout(function () {
            install.addClass('active');
          }, 500);
        }
      };
      var start = function start() {
        Lampa.Loading.stop();
        setTimeout(function () {
          down.addClass('active');
        }, 600);
        next();
        Lampa.Controller.add('shots_present', {
          toggle: function toggle() {
            Lampa.Controller.clear();
            Lampa.Background.theme('#08090D');
          },
          enter: push,
          down: next,
          back: stop
        });
        Lampa.Controller.toggle('shots_present');
      };
      var stop = function stop() {
        destroy();
        Lampa.Loading.stop();
        params.onBack && params.onBack();
      };
      var preload = function preload() {
        var slides_loaded = 0;
        for (var i = 1; i <= total; i++) {
          var img = html.find('.slide-' + i)[0];
          img.src = params.slides[i - 1];
          img.onload = function () {
            slides_loaded++;
            if (slides_loaded === total && !cancel) {
              params.onLoad && params.onLoad();
              start();
              clearTimeout(timeload);
            }
          };
        }
        timeload = setTimeout(stop, 10000);
      };
      var destroy = function destroy() {
        start = function start() {};
        cancel = true;
        clearTimeout(timeload);
        html.remove();
        Lampa.Background.theme('reset');
      };
      down.on('click', next);
      install.on('click', push);
      Lampa.Loading.start(stop);
      preload();
    }

    function Panel() {
      this.html = Lampa.Template.js('shots_lenta_panel');
      this.network = new Lampa.Reguest();
      this.cache = {};
      this.image = this.html.find('.shots-lenta-panel__card-img');
      this.title = this.html.find('.shots-lenta-panel__card-title');
      this.recorder = this.html.find('.shots-lenta-panel__recorder');
      this.year = this.html.find('.shots-lenta-panel__card-year');
      this.cardbox = this.html.find('.shots-lenta-panel__card');
      this.body = this.html.find('.explorer-card__head-body');
      this.last = this.html.find('.selector');
      this.poster = this.image.find('img');
      this.create = function () {
        var _this = this;
        this.tags = new Tags$1();
        this.author = new Author();
        var waite_like = false,
          waite_fav = false;
        this.author.render().addClass('selector');
        this.html.find('.shots-lenta-panel__tags').append(this.tags.render());
        this.html.find('.shots-lenta-panel__author').append(this.author.render());
        this.poster.onload = function () {
          _this.image.addClass('loaded');
        };
        this.poster.onerror = function () {
          _this.poster.src = './img/img_broken.svg';
        };
        Array.from(this.html.querySelectorAll('.selector')).forEach(function (button) {
          button.on('hover:focus hover:hover hover:touch', function () {
            _this.last = button;
          });
        });
        this.html.find('.action-liked').on('hover:enter', function () {
          if (waite_like) return;
          waite_like = true;
          Likes.toggle(_this.shot.id, function (ready) {
            _this.shot.liked += ready ? -1 : 1;
            Lampa.Listener.send('shots_update', _objectSpread2({}, _this.shot));
            _this.update();
            waite_like = false;
          });
        });
        this.html.find('.action-favorite').on('hover:enter', function () {
          if (waite_fav) return;
          waite_fav = true;
          Favorite.toggle(_this.shot, function (ready) {
            _this.shot.saved += ready ? -1 : 1;
            Lampa.Listener.send('shots_update', _objectSpread2({}, _this.shot));
            _this.update();
            waite_fav = false;
          });
        });
        this.html.find('.shots-author').on('hover:enter', function () {
          Lampa.Controller.back();
          Lampa.Activity.push({
            url: '',
            component: 'shots_channel',
            title: 'Shots - ' + Lampa.Utils.capitalizeFirstLetter(_this.shot.email),
            id: _this.shot.cid,
            name: _this.shot.email,
            page: 1
          });
        });
        this.html.find('.action-more').on('hover:enter', this.menu.bind(this));
        this.image.on('hover:enter', function () {
          Lampa.Controller.back();
          Lampa.Activity.push({
            url: '',
            component: 'full',
            source: 'tmdb',
            id: _this.shot.card_id,
            method: _this.shot.card_type,
            card: {
              id: _this.shot.card_id
            }
          });
        });
      };
      this.menu = function () {
        var _this2 = this;
        var menu = [];
        var controller = Lampa.Controller.enabled().controller.link;
        var back = function back() {
          controller.html.removeClass('hide');
          Lampa.Controller.toggle('shots_lenta');
          controller.video.play();
          Lampa.Background.theme('black');
        };
        menu.push({
          title: Lampa.Lang.translate('shots_button_report'),
          onSelect: function onSelect() {
            Modals.shotsReport(_this2.shot.id, back);
          }
        });
        if (Lampa.Account.Permit.account.id == this.shot.cid || Lampa.Account.Permit.account.id == 1) {
          menu.push({
            title: Lampa.Lang.translate('shots_button_delete_video'),
            onSelect: function onSelect() {
              Modals.shotsDelete(_this2.shot.id, function () {
                back();
                Created.remove(_this2.shot);
              });
            }
          });
        }
        menu.push({
          title: Lampa.Lang.translate('more'),
          separator: true
        });
        menu.push({
          title: Lampa.Lang.translate('shots_how_create_video_title'),
          subtitle: Lampa.Lang.translate('shots_how_create_video_subtitle'),
          onSelect: function onSelect() {
            Slides({
              slides: [1, 2, 3, 4].map(function (i) {
                return Defined.cdn + 'record/slide-' + i + '.jpg';
              }),
              button_text: 'shots_button_good',
              onLoad: function onLoad() {
                controller.html.addClass('hide');
              },
              onInstall: back,
              onBack: back
            });
          }
        });
        controller.video.pause();
        Lampa.Select.show({
          title: Lampa.Lang.translate('title_action'),
          items: menu,
          onBack: function onBack() {
            Lampa.Controller.toggle('shots_lenta');
            controller.video.play();
          }
        });
      };
      this.update = function () {
        this.html.find('.action-liked').toggleClass('active', Likes.find(this.shot.id));
        this.html.find('.action-favorite').toggleClass('active', Favorite.find(this.shot.id));
        this.tags.update(this.shot);
        if (this.shot.tags && this.shot.tags.length) {
          var elem_tags = $('<div>' + this.shot.tags.slice(0, 3).map(function (t) {
            return '#' + Lampa.Lang.translate('shots_tag_' + t.slug);
          }).join(' ') + '</div>');
          this.tags.render().append(elem_tags);
        }
        var elem_likes = $('<div><svg><use xlink:href="#sprite-love"></use></svg> ' + Lampa.Utils.bigNumberToShort(this.shot.liked || 0) + '</div>');
        var elem_saved = $('<div><svg><use xlink:href="#sprite-favorite"></use></svg> ' + Lampa.Utils.bigNumberToShort(this.shot.saved || 0) + '</div>');
        elem_likes.toggleClass('hide', (this.shot.liked || 0) == 0);
        elem_saved.toggleClass('hide', (this.shot.saved || 0) == 0);
        this.tags.render().append(elem_likes);
        this.tags.render().append(elem_saved);
        if (Lampa.Account.Permit.account.id == 1) this.recorder.text(this.shot.recorder || '').toggleClass('hide', !this.shot.recorder);
      };
      this.change = function (shot) {
        this.shot = shot;
        this.author.update(shot);
        this.network.clear();
        this.load();
        this.update();
      };
      this.load = function () {
        this.image.removeClass('loaded');
        this.cardbox.addClass('loading');
        if (this.cache[this.shot.id]) return this.loadDone(this.cache[this.shot.id]);
        var url = Lampa.TMDB.api(this.shot.card_type + '/' + this.shot.card_id + '?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.field('tmdb_lang'));
        this.network.silent(url, this.loadDone.bind(this));
      };
      this.loadDone = function (card) {
        this.shot.card_title = card.title || card.name || card.original_title || card.original_name;
        this.shot.card_poster = card.poster_path || card.backdrop_path;
        this.shot.card_year = (card.release_date || card.first_air_date || '----').slice(0, 4);
        this.title.text(this.shot.card_title);
        this.year.text(this.shot.card_year);
        this.poster.src = Lampa.TMDB.image('t/p/w300/' + this.shot.card_poster);
        this.cardbox.removeClass('loading');
        this.cache[this.shot.id] = card;
      };
      this.render = function () {
        return this.html;
      };
      this.destroy = function () {
        clearTimeout(this.show_timeout);
        this.html.remove();
        this.cache = {};
        this.network.clear();
      };
    }

    function Lenta(first, playlist) {
      this.html = Lampa.Template.js('shots_lenta');
      this.current = first;
      this.playlist = playlist || [];
      this.position = playlist.indexOf(playlist.find(function (i) {
        return i.id == first.id;
      }));
      this.page = 1;
      this.start = function () {
        this.video = new Video(this.current);
        this.panel = new Panel(this.current);
        this.video.create();
        this.panel.create();
        if (Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice()) {
          var head = Lampa.Template.js('head_backward', {
            title: ''
          });
          head.find('.head-backward__button').on('click', Lampa.Controller.back.bind(Lampa.Controller));
          this.html.append(head);
        }
        this.html.find('.shots-lenta__video').append(this.video.render());
        this.html.find('.shots-lenta__panel').append(this.panel.render());
        $('body').addClass('ambience--enable').append(this.html);
        this.video.change(this.current, 'next');
        this.panel.change(this.current, 'next');
        this.controller();
        this.scroll();
        this.html.on('mousemove', this.focus.bind(this));
        Lampa.Background.theme('black');
        Metric.counter('shots_lenta_launch');
      };
      this.scroll = function () {
        var _self = this;
        if (Lampa.Utils.isTouchDevice()) {
          var movestart = function movestart(e) {
            start_position = e.clientY;
            end_position = start_position;
            move_position = start_position;
            time_scroll = Date.now();
          };
          var move = function move(e) {
            move_position = e.clientY;
            end_position = e.clientY;
            var delta = move_position - start_position;
            elemmove.style.transform = 'translateY(' + delta + 'px)';
          };
          var moveend = function moveend(e) {
            elemmove.style.transform = 'translateY(0px)';
            var threshold = window.innerHeight / 2.5;
            var csroll_speed = Date.now() - time_scroll;
            if (csroll_speed < 200) {
              threshold = threshold / 6;
            }
            if (start_position - end_position > threshold) {
              _self.move('next');
            } else if (end_position - start_position > threshold) {
              _self.move('prev');
            }
            end_position = 0;
            start_position = 0;
            move_position = 0;
          };
          var start_position = 0;
          var move_position = 0;
          var end_position = 0;
          var time_scroll = 0;
          var elemmove = this.html.find('.shots-lenta-video__video-element');
          this.html.addEventListener('touchstart', function (e) {
            movestart(e.touches[0] || e.changedTouches[0]);
          });
          this.html.addEventListener('touchmove', function (e) {
            move(e.touches[0] || e.changedTouches[0]);
          });
          this.html.addEventListener('touchend', moveend);
        } else {
          var wheel = function wheel(e) {
            if (Date.now() - time > 500) {
              time = Date.now();
              if (e.wheelDelta / 120 > 0) {
                _self.move('prev');
              } else {
                _self.move('next');
              }
            }
          }; // Обрабатываем скролл колесом мыши
          var time = 0;
          this.html.addEventListener('mousewheel', wheel);
          this.html.addEventListener('wheel', wheel);
        }
      };
      this.focus = function () {
        var _this = this;
        if (Lampa.Utils.isTouchDevice()) return;
        clearTimeout(this.focus_timeout);
        this.html.toggleClass('shots-lenta--hide-panel', false);
        this.focus_timeout = setTimeout(function () {
          if (Lampa.Controller.enabled().name !== 'shots_lenta') return;
          _this.html.toggleClass('shots-lenta--hide-panel', true);
          Lampa.Controller.add('shots_lenta_idle', {
            link: _this.video,
            toggle: function toggle() {
              Lampa.Controller.clear();
            },
            left: _this.controller.bind(_this),
            right: _this.controller.bind(_this),
            up: function up() {
              _this.move('prev');
              _this.focus();
            },
            down: function down() {
              _this.move('next');
              _this.focus();
            },
            enter: _this.controller.bind(_this),
            back: _this.controller.bind(_this)
          });
          Lampa.Controller.toggle('shots_lenta_idle');
        }, 7000);
      };
      this.controller = function () {
        var _this2 = this;
        Lampa.Controller.add('shots_lenta', {
          link: this,
          toggle: function toggle() {
            Lampa.Controller.clear();
            Lampa.Controller.collectionSet(_this2.html);
            Lampa.Controller.collectionFocus(_this2.panel.body, _this2.html);
            _this2.focus();
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');
            _this2.focus();
          },
          right: function right() {
            if (Navigator.canmove('right')) Navigator.move('right');
            _this2.focus();
          },
          up: function up() {
            _this2.move('prev');
            _this2.focus();
          },
          down: function down() {
            _this2.move('next');
            _this2.focus();
          },
          back: this.back.bind(this)
        });
        Lampa.Controller.toggle('shots_lenta');
      };
      this.move = function (direction) {
        var start_position = this.position;
        if (direction == 'next') {
          this.position++;
          if (this.position >= this.playlist.length) {
            this.position = this.playlist.length - 1;
          }
        } else if (direction == 'prev') {
          this.position--;
          if (this.position < 0) {
            this.position = 0;
          }
        }
        if (start_position !== this.position) {
          this.current = this.playlist[this.position];
          this.video.change(this.current, direction);
          this.panel.change(this.current, direction);
          Lampa.Controller.toggle('shots_lenta');
          Metric.counter('shots_lenta_next');
        }
        if (this.position >= this.playlist.length - 3) {
          this.nextPart();
        }
      };
      this.nextPart = function () {
        var _this3 = this;
        if (this.onNext) {
          this.loading_part = true;
          this.page++;
          this.onNext(this.page, function (results) {
            _this3.loading_part = false;
            if (results && results.length) {
              results.forEach(function (i) {
                if (!_this3.playlist.find(function (p) {
                  return p.id == i.id;
                })) _this3.playlist.push(i);
              });
            }
          });
        }
      };
      this.back = function () {
        this.destroy();
        Lampa.Controller.toggle('content');
      };
      this.destroy = function () {
        clearTimeout(this.focus_timeout);
        this.video.destroy();
        this.panel.destroy();
        this.html.remove();
        Lampa.Background.theme('reset');
      };
    }

    function Shot(item_data) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var clone = Lampa.Arrays.clone(item_data);
      item_data.card = {
        id: item_data.card_id,
        type: item_data.card_type,
        title: item_data.card_title,
        release_date: item_data.card_year,
        poster_path: item_data.card_poster
      };
      item_data.img = item_data.screen;
      var item = Lampa.Maker.make('Episode', item_data, function (module) {
        return module.only('Card', 'Callback');
      });
      item.use({
        onCreate: function onCreate() {
          var _this = this;
          this.html.find('.full-episode__name').remove();
          this.html.find('.full-episode__num').remove();
          if (params.without_card) this.html.find('.card-episode__footer').addClass('hide');
          var tags = new Tags$1(this.data);
          tags.create();
          this.html.find('.full-episode__date').empty().append(tags.render());
          this.html.addClass('full-episode--shot');
          this.liked = $("\n                <div class=\"full-episode__liked\">\n                    <svg><use xlink:href=\"#sprite-love\"></use></svg>\n                    <span>".concat(Lampa.Utils.bigNumberToShort(this.data.liked), "</span>\n                </div>\n            "));
          this.html.find('.full-episode__date').append(this.liked);
          this.status = Lampa.Template.elem('div', {
            "class": 'shots-status hide'
          });
          this.html.find('.card__left').append(this.status);
          this.html.find('.full-episode').append($('<div class="full-episode__shot-icon"><svg><use xlink:href="#sprite-shots"></use></svg></div>'));
          this.updateStatusHandler = function (e) {
            if (e.id !== _this.data.id) return;
            _this.status.toggleClass('hide', e.status == 'ready');
            _this.status.toggleClass('shots-status--error', e.status == 'error');
            _this.status.toggleClass('shots-status--processing', e.status == 'processing' || e.status == 'converting');
            _this.status.toggleClass('shots-status--ready', e.status == 'ready');
            _this.status.toggleClass('shots-status--deleted', e.status == 'deleted');
            _this.status.toggleClass('shots-status--blocked', e.status == 'blocked');
            _this.status.text(e.status == 'error' ? Lampa.Lang.translate('shots_status_error') : e.status == 'processing' || e.status == 'converting' ? Lampa.Lang.translate('shots_status_processing') : e.status == 'blocked' ? Lampa.Lang.translate('shots_status_blocked') : e.status == 'deleted' ? Lampa.Lang.translate('shots_status_deleted') : e.status == 'ready' ? Lampa.Lang.translate('shots_status_ready') : '');
            Utils.videoReplaceStatus(e, _this.data);
            Utils.videoReplaceStatus(e, clone);
            _this.data.img = e.screen;
            if (e.screen) _this.emit('visible');
          };
          this.updateDataHandler = function (e) {
            if (e.id !== _this.data.id) return;
            _this.liked.find('span').text(Lampa.Utils.bigNumberToShort(e.liked || _this.data.liked));
          };
          Lampa.Listener.follow('shots_status', this.updateStatusHandler);
          Lampa.Listener.follow('shots_update', this.updateDataHandler);
          this.updateStatusHandler(this.data);
          if (this.data.status == 'processing' && Lampa.Account.Permit.account.id == this.data.cid) Handler.add(clone);
        },
        onlyEnter: function onlyEnter() {
          var lenta = new Lenta(clone, params.playlist || [this.data]);
          lenta.onNext = params.onNext;
          lenta.start();
        },
        onlyFocus: function onlyFocus() {
          Lampa.Background.change(this.data.img || '');
        },
        onRemove: function onRemove() {
          Lampa.Listener.remove('shots_status', this.updateStatusHandler);
          Lampa.Listener.remove('shots_update', this.updateDataHandler);
        }
      });
      return item;
    }

    function component$3(object) {
      Lampa.Utils.extendParams(object, {
        items: {
          cols: 4
        }
      });
      var comp = Lampa.Maker.make('Category', object, function (module) {
        return module.toggle(Lampa.Maker.module('Category').MASK.base, 'Pagination');
      });
      var playlist = [];
      comp.use({
        onCreate: function onCreate() {
          var _this = this;
          Api.shotsList(object.url, object.page, function (result) {
            playlist = Lampa.Arrays.clone(result.results);
            _this.build(result);
          }, this.empty.bind(this));
        },
        onNext: function onNext(resolve, reject) {
          Api.shotsList(object.url, object.page, function (result) {
            playlist = playlist.concat(result.results);
            resolve(result);
          }, reject.bind(this));
        },
        onlyCreateAndAppend: function onlyCreateAndAppend(element) {
          try {
            var item = new Shot(element, {
              playlist: playlist
            });
            this.emit('instance', item, element);
            item.create();
            this.emit('append', item, element);
          } catch (e) {
            console.warn('Warning', 'onCreateAndAppend error:', e.message, e.stack);
          }
        },
        onDestroy: function onDestroy() {
          playlist = null;
        }
      });
      return comp;
    }

    function component$2(object) {
      Lampa.Utils.extendParams(object, {
        items: {
          cols: Lampa.Storage.field('interface_size') == 'bigger' ? 4 : 3
        },
        empty: {
          descr: Lampa.Lang.translate('shots_card_empty_descr'),
          buttons: [{
            title: Lampa.Lang.translate('shots_how_create_video_title'),
            onEnter: function onEnter() {
              Slides({
                slides: [1, 2, 3, 4].map(function (i) {
                  return Defined.cdn + 'record/slide-' + i + '.jpg';
                }),
                button_text: 'shots_button_good',
                onLoad: function onLoad() {},
                onInstall: function onInstall() {
                  Lampa.Controller.toggle('content');
                },
                onBack: function onBack() {
                  Lampa.Controller.toggle('content');
                }
              });
            }
          }]
        }
      });
      var comp = Lampa.Maker.make('Category', object, function (module) {
        return module.toggle(Lampa.Maker.module('Category').MASK.base, 'Pagination', 'Explorer');
      });
      var playlist = [];
      comp.use({
        onCreate: function onCreate() {
          var _this = this;
          Api.shotsCard(object.card, object.page, function (result) {
            playlist = Lampa.Arrays.clone(result.results);
            _this.build(result);
          }, this.empty.bind(this));
        },
        onNext: function onNext(resolve, reject) {
          Api.shotsCard(object.card, object.page, function (result) {
            playlist = playlist.concat(result.results);
            resolve(result);
          }, reject.bind(this));
        },
        onlyCreateAndAppend: function onlyCreateAndAppend(element) {
          try {
            var item = new Shot(element, {
              playlist: playlist,
              without_card: true
            });
            this.emit('instance', item, element);
            item.create();
            this.emit('append', item, element);
          } catch (e) {
            console.warn('Warning', 'onCreateAndAppend error:', e.message, e.stack);
          }
        },
        onDestroy: function onDestroy() {
          playlist = null;
        }
      });
      return comp;
    }

    function component$1(object) {
      Lampa.Utils.extendParams(object, {
        items: {
          cols: 4
        }
      });
      var comp = Lampa.Maker.make('Category', object, function (module) {
        return module.toggle(Lampa.Maker.module('Category').MASK.base, 'Pagination');
      });
      var playlist = [];
      comp.use({
        onCreate: function onCreate() {
          var _this = this;
          Api.shotsChannel(object.id, object.page, function (result) {
            playlist = Lampa.Arrays.clone(result.results);
            _this.build(result);
          }, this.empty.bind(this));
        },
        onNext: function onNext(resolve, reject) {
          Api.shotsChannel(object.id, object.page, function (result) {
            playlist = playlist.concat(result.results);
            resolve(result);
          }, reject.bind(this));
        },
        onlyCreateAndAppend: function onlyCreateAndAppend(element) {
          try {
            var item = new Shot(element, {
              playlist: playlist
            });
            this.emit('instance', item, element);
            item.create();
            this.emit('append', item, element);
          } catch (e) {
            console.warn('Warning', 'onCreateAndAppend error:', e.message, e.stack);
          }
        },
        onDestroy: function onDestroy() {
          playlist = null;
        }
      });
      return comp;
    }

    function backward() {
      var head = Lampa.Template.get('head_backward', {
        title: ''
      });
      head.find('.head-backward__button').on('click', function () {
        Lampa.Controller.back();
      });
      return head;
    }
    function Present() {
      this.onComplete = function () {};
      this.onBack = function () {};
      this.start = function () {
        var _this = this;
        var last_time_watched = Lampa.Storage.get('shots_present_watched', '0');
        var wait_time = 1000 * 60 * 60 * 24 * 30; // 5 дней

        if (Date.now() - last_time_watched < wait_time) {
          return this.onComplete();
        }
        Lampa.Background.theme('black');
        this.html = $("<div class=\"shots-video-present\">\n            <video autoplay poster=\"./img/video_poster.png\"></video>\n        </div>");
        if (Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice()) {
          this.html.append(backward());
        }
        this.video = this.html.find('video')[0];
        if (Lampa.Platform.is('apple')) this.video.setAttribute('playsinline', 'true');
        this.video.src = 'https://cdn.cub.rip/shots_present/present.mp4';
        this.video.load();
        this.video.addEventListener('ended', this.stop.bind(this));
        this.video.addEventListener('error', this.stop.bind(this));
        this.video.addEventListener('timeupdate', function () {
          clearTimeout(_this.timer_waite);
        });
        this.timer_waite = setTimeout(this.stop.bind(this), 6000);
        $('body').append(this.html);
        Lampa.Controller.add('shots_video_present', {
          toggle: function toggle() {
            Lampa.Controller.clear();
          },
          back: this.back.bind(this)
        });
        Lampa.Controller.toggle('shots_video_present');
      };
      this.stop = function () {
        this.onComplete();
        Lampa.Storage.set('shots_present_watched', Date.now());
      };
      this.back = function () {
        this.onBack();
      };
      this.destroy = function () {
        this.stop = function () {};
        this.onComplete = function () {};
        this.onBack = function () {};
        if (!this.video) return;
        this.video.pause();
        this.video.src = '';
        clearTimeout(this.timer_waite);
        this.html.remove();
        Lampa.Background.theme('reset');
      };
    }

    var component = 'shots';
    var icon = "<svg id=\"sprite-shots\" viewBox=\"0 0 512 512\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path d=\"M253.266 512a19.166 19.166 0 0 1-19.168-19.168V330.607l-135.071-.049a19.164 19.164 0 0 1-16.832-28.32L241.06 10.013a19.167 19.167 0 0 1 36.005 9.154v162.534h135.902a19.167 19.167 0 0 1 16.815 28.363L270.078 502.03a19.173 19.173 0 0 1-16.812 9.97z\" fill=\"white\"></path>\n</svg>";
    function init() {
      Lampa.SettingsApi.addComponent({
        component: component,
        icon: icon,
        name: Lampa.Lang.translate('Shots')
      });
      Lampa.SettingsApi.addParam({
        component: component,
        param: {
          name: 'shots_in_player',
          type: 'trigger',
          "default": true
        },
        field: {
          name: Lampa.Lang.translate('shots_settings_in_player')
        }
      });
      Lampa.SettingsApi.addParam({
        component: component,
        param: {
          name: 'shots_in_card',
          type: 'trigger',
          "default": true
        },
        field: {
          name: Lampa.Lang.translate('shots_settings_in_card')
        }
      });
    }
    var Settings = {
      init: init
    };

    function startPlugin() {
      window.plugin_shots_ready = true;
      function init() {
        Lang.init();
        Templates.init();
        Player.init();
        Handler.init();
        Settings.init();
        Favorite.init();
        Created.init();
        View.init();
        Tags.load();
        $('body').append("\n            <style>\n            @-webkit-keyframes shots-recorder-blink{0%,50%,100%{opacity:1}25%,75%{opacity:.2}}@keyframes shots-recorder-blink{0%,50%,100%{opacity:1}25%,75%{opacity:.2}}@-webkit-keyframes shots-progress-waiting{0%{width:0;left:0}50%{width:50%;left:25%}100%{width:0;left:100%}}@keyframes shots-progress-waiting{0%{width:0;left:0}50%{width:50%;left:25%}100%{width:0;left:100%}}@-webkit-keyframes shots-placeholder-shimmer{0%{background-position:-150% 0}100%{background-position:150% 0}}@keyframes shots-placeholder-shimmer{0%{background-position:-150% 0}100%{background-position:150% 0}}@-webkit-keyframes shots-animate-down{0%{-webkit-transform:translateY(-50%);transform:translateY(-50%)}100%{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes shots-animate-down{0%{-webkit-transform:translateY(-50%);transform:translateY(-50%)}100%{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes shots-animate-up{0%{-webkit-transform:translateY(50%);transform:translateY(50%)}100%{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes shots-animate-up{0%{-webkit-transform:translateY(50%);transform:translateY(50%)}100%{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes shots-push-button{0%{-webkit-transform:scale(1);transform:scale(1)}25%{-webkit-transform:scale(1.35);transform:scale(1.35)}100%{-webkit-transform:scale(1);transform:scale(1)}}@keyframes shots-push-button{0%{-webkit-transform:scale(1);transform:scale(1)}25%{-webkit-transform:scale(1.35);transform:scale(1.35)}100%{-webkit-transform:scale(1);transform:scale(1)}}@-webkit-keyframes shots-slides-slide-up{0%{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes shots-slides-slide-up{0%{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}100%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@-webkit-keyframes shots-slides-slide-out{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}@keyframes shots-slides-slide-out{0%{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}100%{-webkit-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}}.shots-player-recorder{position:fixed;left:0;top:0;width:100%;height:100%;z-index:50}.shots-player-recorder__body{position:fixed;left:0;right:0;bottom:1.5em;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.shots-player-recorder__plate{background-color:rgba(0,0,0,0.6);-webkit-border-radius:3em;border-radius:3em;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.shots-player-recorder__text{padding:0 1.2em;line-height:1.4}.shots-player-recorder__button{padding:.9em;width:3em;height:3em;-webkit-border-radius:100%;border-radius:100%;position:relative;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.shots-player-recorder__button.animate-trigger-enter{-webkit-animation:animation-trigger-enter .2s forwards;animation:animation-trigger-enter .2s forwards}.shots-player-recorder__button>svg{width:1.2em;height:1.2em}.shots-player-recorder__button>div{position:absolute;bottom:100%;left:50%;-webkit-transform:translateX(-50%);-ms-transform:translateX(-50%);transform:translateX(-50%);margin-bottom:1em;text-wrap:nowrap;display:none;text-shadow:0 0 .2em rgba(0,0,0,0.5);color:#fff}.shots-player-recorder__button.focus{background:#fff;color:#000}.shots-player-recorder__button.focus>div{display:block}.shots-preview{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}.shots-preview__left{width:45%;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.shots-preview__screenshot{-webkit-border-radius:1em;border-radius:1em;padding-bottom:64%;position:relative;background:#222;overflow:hidden}.shots-preview__screenshot>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;opacity:0}.shots-preview__body{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;padding-left:2em;line-height:1.4}.shots-preview__year{font-size:.8em;margin-bottom:.5em}.shots-preview__title{font-size:1.3em;margin-bottom:.5em;overflow:hidden;-o-text-overflow:'.';text-overflow:'.';display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical}.shots-selector{padding:1.3em;-webkit-border-radius:.7em;border-radius:.7em;font-size:1.1em}.shots-selector:not(.shots-selector--transparent){background:rgba(255,255,255,0.1)}.shots-selector.focus{background:#fff;color:#000}.shots-checkbox{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.shots-checkbox__icon{width:1.3em;height:1.3em;margin-right:1em;border:.1em solid #fff;-webkit-border-radius:.3em;border-radius:.3em;position:relative}.shots-checkbox--checked .shots-checkbox__icon::after{content:'';position:absolute;left:.2em;top:.2em;right:.2em;bottom:.2em;background:#fff;-webkit-border-radius:.2em;border-radius:.2em}.shots-checkbox.focus .shots-checkbox__icon{border-color:#000}.shots-checkbox.focus .shots-checkbox__icon::after{background:#000}.shots-button{text-align:center}.shots-button+.shots-button{margin-top:.2em}.shots-modal-footer{padding-top:1em}.shots-view-button__title{position:relative}.shots-view-button__count{position:absolute;top:1.9em;left:12em;background:rgba(255,255,255,0.4);color:#fff;font-size:.7em;padding:.1em .4em;-webkit-border-radius:1.1em;border-radius:1.1em;text-align:center;min-width:2em;display:block;font-weight:700}.selectbox-item.focus .shots-view-button__count{background:rgba(0,0,0,0.4);color:#fff}.shots-modal-upload__body{margin-top:1.5em}.shots-modal-upload__body>*+*{margin-top:.2em}.shots-modal-upload__video{-webkit-border-radius:1em;border-radius:1em;overflow:hidden;margin-top:1.5em;background:#000}.shots-modal-upload__video video{background:#000;width:100%;display:block;aspect-ratio:16/9;-o-object-fit:contain;object-fit:contain}.shots-tags{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;margin:-0.25em}.shots-tags>div{padding:.3em .6em;-webkit-border-radius:.5em;border-radius:.5em;background:rgba(0,0,0,0.2);margin:.25em}.shots-tags>div>svg{width:1em !important;height:1em !important;margin-right:.6em;vertical-align:bottom}.shots-progress__text{font-size:.8em;margin-bottom:.8em}.shots-progress__bar{background:rgba(255,255,255,0.17);position:relative;-webkit-border-radius:1em;border-radius:1em;height:.4em;overflow:hidden}.shots-progress__bar>div{height:.4em;-webkit-border-radius:1em;border-radius:1em;background:#fff;position:absolute;left:0;top:0}.shots-progress.focus{background:rgba(255,255,255,0.1);color:#fff}.shots-progress.state--waiting .shots-progress__bar>div{width:10%;-webkit-animation:shots-progress-waiting 1s infinite;animation:shots-progress-waiting 1s infinite}.shots-lenta{position:absolute;left:0;top:0;width:100%;height:100%;z-index:50;background:#000}.shots-lenta--hide-panel .shots-lenta__panel{opacity:0;pointer-events:none;-webkit-transform:translate3d(0,2em,0);transform:translate3d(0,2em,0)}.shots-lenta--hide-panel .shots-lenta-video__progress-bar{opacity:.2;pointer-events:none}.shots-lenta__video{position:absolute;left:0;top:0;width:100%;height:100%;background:#000}.shots-lenta__panel{position:absolute;bottom:0;left:0;right:0;padding:1em;padding-bottom:2em;background:-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,0)),to(rgba(0,0,0,0.54)));background:-webkit-linear-gradient(top,rgba(0,0,0,0) 0,rgba(0,0,0,0.54) 100%);background:-o-linear-gradient(top,rgba(0,0,0,0) 0,rgba(0,0,0,0.54) 100%);background:linear-gradient(to bottom,rgba(0,0,0,0) 0,rgba(0,0,0,0.54) 100%);-webkit-transition:opacity .3s ease,-webkit-transform .3s ease;transition:opacity .3s ease,-webkit-transform .3s ease;-o-transition:transform .3s ease,opacity .3s ease;transition:transform .3s ease,opacity .3s ease;transition:transform .3s ease,opacity .3s ease,-webkit-transform .3s ease}.shots-lenta .head-backward__button{top:1em}.shots-lenta-video__video-element{position:absolute;left:0;top:0;width:100%;height:100%;-o-object-fit:contain;object-fit:contain;background:#000}.shots-lenta-video__progress-bar{position:absolute;z-index:1;left:1em;right:1em;bottom:1em;background:rgba(255,255,255,0.3);-webkit-border-radius:1em;border-radius:1em;-webkit-transition:opacity .3s ease,-webkit-transform .3s ease;transition:opacity .3s ease,-webkit-transform .3s ease;-o-transition:transform .3s ease,opacity .3s ease;transition:transform .3s ease,opacity .3s ease;transition:transform .3s ease,opacity .3s ease,-webkit-transform .3s ease}.shots-lenta-video__progress-bar>div{height:.3em;-webkit-border-radius:1em;border-radius:1em;background:#fff;-webkit-transition:width .3s linear;-o-transition:width .3s linear;transition:width .3s linear}.shots-lenta-video__loader.show{display:block}.shots-lenta-video__layer{position:absolute;left:0;top:0;width:100%;height:100%}.shots-lenta-panel{position:relative}.shots-lenta-panel .explorer-card__head-body{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1}@media screen and (max-width:400px){.shots-lenta-panel .explorer-card__head-left{font-size:.8em}}.shots-lenta-panel__card{width:50%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-ms-flex-align:end;align-items:flex-end;margin-bottom:0}@media screen and (max-width:580px){.shots-lenta-panel__card{width:80%}}.shots-lenta-panel__card-title{font-size:1.8em;margin-top:.3em;line-height:1.4;text-shadow:0 0 .2em rgba(0,0,0,0.5);overflow:hidden;-o-text-overflow:'.';text-overflow:'.';display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical}.shots-lenta-panel__card-year{font-size:1em;display:inline-block}.shots-lenta-panel__card-img{background:rgba(255,255,255,0.1);-webkit-border-radius:.3em;border-radius:.3em}.shots-lenta-panel__card-img img{opacity:0}.shots-lenta-panel__card-img.loaded{background:transparent}.shots-lenta-panel__card-img.loaded img{opacity:1}.shots-lenta-panel__card-img.focus:after{z-index:1;right:0;left:0;bottom:0;top:0;-webkit-border-radius:.3em;border-radius:.3em}.shots-lenta-panel__card.loading .shots-lenta-panel__card-title,.shots-lenta-panel__card.loading .shots-lenta-panel__card-year,.shots-lenta-panel__card.loading .shots-lenta-panel__card-img{background:rgba(255,255,255,0.1);-webkit-border-radius:.3em;border-radius:.3em;color:transparent;background-image:-webkit-gradient(linear,left top,right top,from(rgba(255,255,255,0)),color-stop(50%,rgba(255,255,255,0.25)),to(rgba(255,255,255,0)));background-image:-webkit-linear-gradient(left,rgba(255,255,255,0) 0,rgba(255,255,255,0.25) 50%,rgba(255,255,255,0) 100%);background-image:-o-linear-gradient(left,rgba(255,255,255,0) 0,rgba(255,255,255,0.25) 50%,rgba(255,255,255,0) 100%);background-image:linear-gradient(90deg,rgba(255,255,255,0) 0,rgba(255,255,255,0.25) 50%,rgba(255,255,255,0) 100%);background-size:300% 100%;background-repeat:no-repeat;-webkit-animation:shots-placeholder-shimmer 1.5s ease-in-out infinite;animation:shots-placeholder-shimmer 1.5s ease-in-out infinite}.shots-lenta-panel__card.loading .shots-lenta-panel__card-img img{opacity:0}.shots-lenta-panel__tags{margin-top:1em}.shots-lenta-panel__counters{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}.shots-lenta-panel__recorder{line-height:1.6}.shots-lenta-panel__author{display:inline-block}@media screen and (max-width:580px){.shots-lenta-panel__author{margin-bottom:1em}.shots-lenta-panel__author .shots-author__name{display:none}}.shots-lenta-panel__right{position:absolute;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;padding-left:2em}@media screen and (max-width:580px){.shots-lenta-panel__right{-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column}}@media screen and (max-width:400px){.shots-lenta-panel__right{font-size:1.1em}}.shots-lenta-panel__buttons{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}.shots-lenta-panel__buttons>div{width:3em;height:3em;-webkit-border-radius:100%;border-radius:100%;background:rgba(0,0,0,0.2);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;margin-left:.5em}.shots-lenta-panel__buttons>div>svg{width:1.5em !important;height:1.5em !important}.shots-lenta-panel__buttons>div.focus{background:#fff;color:#000}.shots-lenta-panel__buttons>div.focus.active.action-liked{color:#ea4e4e}.shots-lenta-panel__buttons>div.focus.active.action-favorite{color:#ffc34b}.shots-lenta-panel__buttons>div:not(.active) .icon-fill{fill:transparent}.shots-lenta-panel__buttons>div.active svg{-webkit-animation:shots-push-button .2s ease forwards;animation:shots-push-button .2s ease forwards}@media screen and (max-width:580px){.shots-lenta-panel__buttons{-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column}.shots-lenta-panel__buttons>div{margin-left:0;margin-top:1em}}.shots-counter div{font-size:1.6em;margin-top:.3em}.shots-author{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.shots-author__img{width:3em;height:3em;-webkit-border-radius:100%;border-radius:100%;background:rgba(255,255,255,0.1);overflow:hidden;position:relative}.shots-author__img img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;opacity:0}.shots-author__img.loaded{background:transparent}.shots-author__img.loaded img{opacity:1}.shots-author__name{font-size:1.3em;padding-left:1em;padding-right:1em}.shots-author.focus{background:#fff;-webkit-border-radius:3em;border-radius:3em;color:#000}.shots-author.focus .shots-author__img{-webkit-transform:scale(0.8);-ms-transform:scale(0.8);transform:scale(0.8)}.shots-status{background:rgba(0,0,0,0.5);padding:.3em .8em;-webkit-border-radius:1em;border-radius:.6em;display:inline-block;font-size:.9em;line-height:1.4;padding-top:0}.shots-status--ready{background:#8ab75b}.shots-status--error{background:#d9534f}.shots-status--processing{background:#f0ad4e}.shots-status--blocked{background:#5b7c9c}.shots-status--deleted{background:#d04545}.full-episode--shot .shots-tags>div{background:rgba(0,0,0,0.5)}.full-episode--shot .full-episode__body{background:-webkit-gradient(linear,left bottom,left top,from(rgba(0,0,0,0.5)),color-stop(40%,rgba(0,0,0,0)));background:-webkit-linear-gradient(bottom,rgba(0,0,0,0.5) 0,rgba(0,0,0,0) 40%);background:-o-linear-gradient(bottom,rgba(0,0,0,0.5) 0,rgba(0,0,0,0) 40%);background:linear-gradient(0,rgba(0,0,0,0.5) 0,rgba(0,0,0,0) 40%)}.full-episode--shot .full-episode__date{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.full-episode--shot .full-episode__liked{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.full-episode--shot .full-episode__liked svg{width:1em !important;height:1em !important;margin-right:.3em}.full-episode--shot .full-episode__shot-icon{position:absolute;top:1em;left:1em}.full-episode--shot .full-episode__shot-icon svg{width:2em !important;height:2em !important}.full-episode--shot .shots-status{margin-top:.7em}.shots-player--recording .player-panel,.shots-player--recording .player-info,.shots-player--recording .player-footer{display:none}.shots-player-card{padding:0;width:16em}.shots-player-card .card__view{margin-bottom:0}.shots-player-segments{position:relative;z-index:1}.shots-player-segments__time{position:absolute;top:0;background:#b995ff;height:100%;height:.4em;pointer-events:none}.shots-player-segments__picture{position:absolute;bottom:1em;display:none;cursor:pointer}.shots-player-segments__picture img{width:7em;height:4em;-o-object-fit:cover;object-fit:cover;opacity:0;-webkit-transition:opacity .3s ease;-o-transition:opacity .3s ease;transition:opacity .3s ease;-webkit-border-radius:.3em;border-radius:.3em}.shots-player-segments__picture--loaded img{opacity:1}.shots-player-segments.focus .shots-player-segments__picture{display:block}.shots-video-present{position:fixed;left:0;top:0;width:100%;height:100%;background:#000;z-index:50}.shots-video-present video{position:fixed;left:0;top:0;width:100%;height:100%;-o-object-fit:contain;object-fit:contain}.shots-video-present .head-backward{position:absolute;top:.65em}.shots-svg-auto{height:auto !important}.shots-svg-auto--helmet{max-height:6em}.shots-selector-tags{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-border-radius:.7em;border-radius:.7em;background:rgba(255,255,255,0.1);padding:.2em}.shots-selector-tags__tag{display:inline-block;background:rgba(0,0,0,0.2);padding:0 1em;-webkit-border-radius:.6em;border-radius:.6em;margin:.2em;position:relative}.shots-selector-tags__tag span{font-size:1.1em;display:inline-block;padding:.6em 0}.shots-selector-tags__tag svg{width:1.2em !important;height:1.2em !important;margin-right:1em}.shots-selector-tags__tag.active::after{content:'';display:block;position:absolute;right:.4em;top:50%;height:.5em;width:.5em;-webkit-border-radius:1em;border-radius:1em;background:#ffb509;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%)}.shots-selector-tags__tag.active span{-webkit-transform:translateX(-0.3em);-ms-transform:translateX(-0.3em);transform:translateX(-0.3em)}.shots-selector-tags__tag.focus{background:#fff;color:#000}.shots-selector-tags__tag.focus::after{background:#000}.shots-line-title{font-size:1.1em;margin-bottom:.7em}.shots-slides{position:absolute;top:0;left:0;width:100%;height:100%;z-index:50}.shots-slides .head-backward{position:absolute;top:.65em}.shots-slides__slide{position:absolute;top:0;left:0;width:100%;height:100%;-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0);-o-object-fit:contain;object-fit:contain;background:#08090d}.shots-slides__slide.active{-webkit-animation:shots-slides-slide-up .5s forwards;animation:shots-slides-slide-up .5s forwards}.shots-slides__slide.up{-webkit-animation:shots-slides-slide-out .5s forwards;animation:shots-slides-slide-out .5s forwards}.shots-slides__down{position:absolute;left:50%;bottom:2em;background:rgba(255,255,255,0.3);padding:.7em 1.3em;-webkit-border-radius:3em;border-radius:3em;-webkit-transform:translate3d(-50%,1em,0);transform:translate3d(-50%,1em,0);opacity:0;-webkit-transition:opacity .5s,-webkit-transform .5s;transition:opacity .5s,-webkit-transform .5s;-o-transition:opacity .5s,transform .5s;transition:opacity .5s,transform .5s;transition:opacity .5s,transform .5s,-webkit-transform .5s}.shots-slides__down.active{opacity:1;-webkit-transform:translate3d(-50%,0,0);transform:translate3d(-50%,0,0)}.shots-slides__install{position:absolute;left:50%;bottom:2em;background:#fff;color:#000;padding:.7em 1.3em;-webkit-border-radius:3em;border-radius:3em;-webkit-transform:translate3d(-50%,3em,0);transform:translate3d(-50%,3em,0);opacity:0;-webkit-transition:opacity .5s,-webkit-transform .5s;transition:opacity .5s,-webkit-transform .5s;-o-transition:opacity .5s,transform .5s;transition:opacity .5s,transform .5s;transition:opacity .5s,transform .5s,-webkit-transform .5s;font-size:1.7em}.shots-slides__install.active{opacity:1;-webkit-transform:translate3d(-50%,0,0);transform:translate3d(-50%,0,0)}.shots-player-button.focus .rec{fill:#ff0101}body.true--mobile .shots-lenta__panel,body.true--mobile .shots-player-recorder__body{bottom:4em}body.true--mobile .shots-lenta-video__progress-bar{bottom:3em}\n            </style>\n        ");

        // Добавляем компоненты

        Lampa.Component.add('shots_list', component$3);
        Lampa.Component.add('shots_card', component$2);
        Lampa.Component.add('shots_channel', component$1);

        // Экран закладок - шоты

        Lampa.ContentRows.add({
          index: 1,
          screen: ['bookmarks'],
          call: function call(params, screen) {
            var favotite = Favorite.get();
            var created = Created.get();
            var lines = [];
            var onmore = {
              emit: {
                onMore: function onMore() {
                  Lampa.Activity.push({
                    url: this.data.type,
                    title: this.data.title,
                    component: 'shots_list',
                    page: 2
                  });
                }
              }
            };
            Lampa.Utils.extendItemsParams(favotite, {
              createInstance: function createInstance(item_data) {
                return Shot(item_data, {
                  playlist: favotite,
                  onNext: function onNext(page, call) {
                    Favorite.page(page, call);
                  }
                });
              }
            });
            Lampa.Utils.extendItemsParams(created, {
              createInstance: function createInstance(item_data) {
                return Shot(item_data, {
                  playlist: created,
                  onNext: function onNext(page, call) {
                    Created.page(page, call);
                  }
                });
              }
            });
            if (favotite.length) {
              lines.push({
                title: Lampa.Lang.translate('shots_title_favorite'),
                results: favotite,
                type: 'favorite',
                total_pages: favotite.length >= 20 ? 2 : 1,
                params: onmore
              });
            }
            if (created.length) {
              lines.push({
                title: Lampa.Lang.translate('shots_title_created'),
                results: created,
                type: 'created',
                total_pages: created.length >= 20 ? 2 : 1,
                params: onmore
              });
            }
            if (lines.length) return lines;
          }
        });

        // Главный экран - шоты

        Lampa.ContentRows.add({
          name: 'shots_main',
          title: 'Shots',
          index: 2,
          screen: ['main'],
          call: function call(params, screen) {
            if (Lampa.Account.Permit.child) return;
            return function (call) {
              Api.lenta({
                sort: 'new'
              }, function (shots) {
                Lampa.Utils.extendItemsParams(shots, {
                  createInstance: function createInstance(item_data) {
                    return Shot(item_data, {
                      playlist: shots,
                      onNext: function onNext(page, call) {
                        Api.lenta({
                          sort: 'new',
                          page: page
                        }, call);
                      }
                    });
                  }
                });
                call({
                  title: 'Shots',
                  results: shots,
                  type: 'favorite',
                  total_pages: 1,
                  icon_svg: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                  icon_bgcolor: '#fff',
                  icon_color: '#fd4518',
                  params: {
                    module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon')
                  }
                });
              });
            };
          }
        });

        // Кнопка в меню

        var waiting = false;
        Lampa.Menu.addButton('<svg><use xlink:href="#sprite-shots"></use></svg>', 'Shots', function () {
          var present = new Present();
          present.onComplete = function () {
            present.onBack = function () {};
            if (waiting) return;
            var items = [{
              title: Lampa.Lang.translate('shots_watch_roll'),
              onSelect: function onSelect() {
                Lampa.Controller.toggle('content');
                waiting = true;
                var call = function call(shots) {
                  Lampa.Loading.stop();
                  present.destroy();
                  waiting = false;
                  if (shots.length == 0) {
                    return Lampa.Bell.push({
                      icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                      text: Lampa.Lang.translate('shots_alert_noshots')
                    });
                  }
                  var lenta = new Lenta(shots[0], shots);
                  lenta.onNext = function (page, call) {
                    Roll.next(call);
                  };
                  lenta.start();
                };
                Lampa.Loading.start(function () {
                  waiting = false;
                  present.destroy();
                  call = function call() {};
                  Lampa.Loading.stop();
                });
                Roll.start(call);
              }
            }, {
              title: Lampa.Lang.translate('shots_choose_tags_select'),
              separator: true
            }];
            Tags.list().forEach(function (tag) {
              items.push({
                title: tag.title,
                tag: tag,
                checkbox: true
              });
            });
            items.push({
              title: Lampa.Lang.translate('shots_watch_tags'),
              onSelect: function onSelect() {
                Lampa.Controller.toggle('content');
                var selected_tags = items.filter(function (a) {
                  return a.checked && a.tag;
                }).map(function (a) {
                  return a.tag;
                });
                var tags_slug = selected_tags.map(function (t) {
                  return t.slug;
                }).join(',');
                if (selected_tags.length == 0) return Lampa.Bell.push({
                  icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                  text: Lampa.Lang.translate('shots_alert_no_tags')
                });
                Api.lenta({
                  tags: tags_slug
                }, function (shots) {
                  if (shots.length == 0) {
                    return Lampa.Bell.push({
                      icon: '<svg><use xlink:href="#sprite-shots"></use></svg>',
                      text: Lampa.Lang.translate('shots_alert_noshots')
                    });
                  }
                  var lenta = new Lenta(shots[0], shots);
                  lenta.onNext = function (page, call) {
                    Api.lenta({
                      tags: tags_slug,
                      page: page
                    }, call);
                  };
                  lenta.start();
                });
              }
            });
            Lampa.Select.show({
              title: Lampa.Lang.translate('Shots'),
              items: items,
              onBack: function onBack() {
                Lampa.Controller.toggle('content');
              }
            });
          };
          present.onBack = function () {
            present.destroy();
            Lampa.Controller.toggle('content');
          };
          present.start();
        });
      }
      if (Lampa.Manifest.app_digital >= 307) {
        if (window.appready) init();else {
          Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') init();
          });
        }
      }
    }
    if (!window.plugin_shots_ready && Lampa.Lang.selected(['ru', 'uk', 'be'])) startPlugin();

})();
