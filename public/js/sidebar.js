document.addEventListener('DOMContentLoaded', () => {
    const sidebarItems = document.querySelectorAll('.nav-list li[data-content]');
    const contentSections = document.querySelectorAll('.content-section');
  
    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        const contentToShow = item.getAttribute('data-content');
  
        contentSections.forEach(section => {
          section.style.display = 'none';
        });
  
        document.getElementById(contentToShow).style.display = 'block';
      });
    });
  
    let sidebar = document.querySelector(".sidebar");
    let closeBtn = document.querySelector("#btn");
  
    closeBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      menuBtnChange();
    });
  
    function menuBtnChange() {
      if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
      } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
      }
    }
});
